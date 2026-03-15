from fastapi import APIRouter
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pydantic import BaseModel
from typing import List

from graph import notes_graph

router = APIRouter()

class ChatHistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatHistoryItem]

system_prompt = """
Role: You are a Professional Note-Taking Specialist who transforms raw text input 
into clean, structured, and well-organized notes.

Task: Generate high-quality notes from the user-provided text by:
    - Extracting the most critical information and key concepts
    - Organizing content into a logical, hierarchical structure
    - Using clear and concise language throughout

Instructions:
    - Use markdown formatting with Main headings, Subheadings, and Bullet points
    - Preserve all important facts, definitions, and examples
    - Remove filler or redundant content
    - End with a short "Summary" section capturing the overall topic
    - Do NOT call any tools — work only with the text provided by the user
"""

@router.post("/process-text")
async def process_text(req: ChatRequest):

    messages = [SystemMessage(content=system_prompt)]

    for msg in req.history:
        if msg.role == "human":
            messages.append(HumanMessage(content=msg.content))
        elif msg.role == "ai":
            messages.append(AIMessage(content=msg.content))

    messages.append(HumanMessage(content=req.message))

    result    = notes_graph.invoke({"messages": messages})
    bot_reply = result["messages"][-1].content

    response_history = [
        {"role": msg.type, "content": msg.content}
        for msg in result["messages"]
    ]

    return {"reply": bot_reply, "history": response_history}