import os
from dotenv import load_dotenv
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_cerebras import ChatCerebras
from langchain_tavily import TavilySearch
from langgraph.prebuilt import ToolNode, tools_condition
import assemblyai as aai
import yt_dlp

load_dotenv()

aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

# === State === #
class State(TypedDict):
    messages: Annotated[list, add_messages]

# === YT Transcribe Tool === #
def transcribe_yt(url: str) -> str:
    """Use this tool only for getting youtube video transcribe"""
    cookie = "cookies.txt"
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": "%(title)s.%(ext)s",
        "cookiefile": cookie,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }]
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)[:-1] + "3"

    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(filename)
    os.remove(filename)
    return transcript.text

#  Tavily Search Tool  
tavily_search = TavilySearch(max_results=2)

def search(query: str) -> str:
    """Use this tool only for web search for trending job roles and career opportunities"""
    return tavily_search.invoke(query)

#  LLM  
llm = ChatCerebras(model="llama3.1-8b")

# build graph with given tools 
def build_graph(tools: list):
    llm_with_tools = llm.bind_tools(tools)

    def chatbot(state: State):
        return {"messages": [llm_with_tools.invoke(state["messages"])]}

    builder = StateGraph(State)
    builder.add_node("chatbot", chatbot)
    builder.add_node("tools", ToolNode(tools))
    builder.add_edge(START, "chatbot")
    builder.add_conditional_edges("chatbot", tools_condition)
    builder.add_edge("tools", "chatbot")
    builder.add_edge("chatbot", END)
    return builder.compile()

#  Pre-built graphs  
notes_graph  = build_graph([])               # no tools needed for notes
yt_graph     = build_graph([transcribe_yt])  # YT transcription tool
career_graph = build_graph([search])         # Tavily search tool
job_search_graph = build_graph([search])     # Tavily search tool