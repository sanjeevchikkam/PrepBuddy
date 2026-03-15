from fastapi import APIRouter
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pydantic import BaseModel
from typing import List

from graph import yt_graph

router = APIRouter()

class ChatHistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatHistoryItem]

system_prompt = """
Role: You are an advanced AI Note-Taking Assistant specializing in generating 
comprehensive, structured notes from YouTube video content.

Task:
    1. Use the tool `transcribe_yt` to extract the full transcript from the provided YouTube link
    2. Analyze the transcript to identify main topics, key insights, and critical takeaways
    3. Generate well-structured notes from the transcript

Instructions:
    - ALWAYS call the `transcribe_yt` tool first with the YouTube URL before generating notes
    - Structure notes with clear headings matching the video's progression
    - Include a brief video summary at the top
    - Use bullet points for key points under each section
    - End with a "Key Takeaways" section
"""

@router.post("/process-yt")
async def process_yt(req: ChatRequest):

    messages = [SystemMessage(content=system_prompt)]

    for msg in req.history:
        if msg.role == "human":
            messages.append(HumanMessage(content=msg.content))
        elif msg.role == "ai":
            messages.append(AIMessage(content=msg.content))

    messages.append(HumanMessage(content=req.message))

    result    = yt_graph.invoke({"messages": messages})
    bot_reply = result["messages"][-1].content

    response_history = [
        {"role": msg.type, "content": msg.content}
        for msg in result["messages"]
    ]

    return {"reply": bot_reply, "history": response_history}