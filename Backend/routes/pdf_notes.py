import json
import logging
import traceback
import fitz  # PyMuPDF

from fastapi import APIRouter, UploadFile, File, Form
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from graph import notes_graph

router = APIRouter()
logger = logging.getLogger(__name__)

system_prompt = """
Role: You are a Professional Note-Taking Specialist who transforms PDF content into 
clear, structured, and easily digestible academic notes.

Task: Generate high-quality notes from the extracted PDF text by:
    - Identifying and extracting the most critical information
    - Organizing content into a logical, hierarchical structure
    - Using clear and concise language
    - Ensuring notes are comprehensible and actionable

Instructions:
    - Use markdown formatting with Main headings, Subheadings, and Bullet points
    - Capture key definitions, formulas, and examples
    - Highlight important concepts and takeaways
    - Do NOT call any tools — text is already extracted and provided to you
"""

@router.post("/process-pdf")
async def process_pdf(req: str = Form(...), pdf: UploadFile = File(None)):

    req_dict = json.loads(req)
    history  = req_dict.get("history", [])

    # Extract text from PDF
    pdf_bytes = await pdf.read()
    doc       = fitz.open(stream=pdf_bytes, filetype="pdf")
    pdf_text  = "\n".join([page.get_text() for page in doc])
    logger.info(f"PDF extracted text length: {len(pdf_text)}")

    # Build messages
    messages = [SystemMessage(content=system_prompt)]

    for msg in history:
        if msg["role"] == "human":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "ai":
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(
        content=f"Here is the text extracted from the PDF. Generate structured notes from this:\n\n{pdf_text}"
    ))

    # Run graph
    result    = notes_graph.invoke({"messages": messages})
    bot_reply = result["messages"][-1].content

    response_history = [
        {"role": msg.type, "content": msg.content}
        for msg in result["messages"]
    ]

    return {"reply": bot_reply, "history": response_history}