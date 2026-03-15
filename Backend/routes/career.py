from fastapi import APIRouter
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pydantic import BaseModel
from typing import List

from graph import career_graph

router = APIRouter()

class ChatHistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatHistoryItem]

system_prompt = """
Role: You are a Professional Career Guide specializing in personalized career path 
development for tech and non-tech professionals.

Task: Conduct a thorough analysis of the user's background, skills, interests, and 
aspirations to develop a precise, actionable career roadmap.

Instructions:
    - Use the `search` tool to look up trending job roles, salaries, and in-demand skills
      before giving recommendations
    - Always provide data-backed suggestions using search results
    - Structure your response with:
        1. Current Profile Analysis
        2. Recommended Career Paths (short-term: 1-2 years)
        3. Long-term Goals (3-5 years)
        4. Skill Gaps & How to Fill Them
        5. Certifications & Courses to pursue
        6. Networking & Job Search Strategy
"""

@router.post("/roadmap")
async def career_roadmap(req: ChatRequest):

    messages = [SystemMessage(content=system_prompt)]

    for msg in req.history:
        if msg.role == "human":
            messages.append(HumanMessage(content=msg.content))
        elif msg.role == "ai":
            messages.append(AIMessage(content=msg.content))

    messages.append(HumanMessage(content=req.message))

    result    = career_graph.invoke({"messages": messages})
    bot_reply = result["messages"][-1].content

    response_history = [
        {"role": msg.type, "content": msg.content}
        for msg in result["messages"]
    ]

    return {"reply": bot_reply, "history": response_history}