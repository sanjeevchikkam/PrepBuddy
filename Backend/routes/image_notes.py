import logging
import traceback
import json
import cv2
import numpy as np
import pytesseract

from fastapi import APIRouter, UploadFile, File, Form
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from graph import notes_graph

router = APIRouter()
logger = logging.getLogger(__name__)

system_prompt = """
Role: You are a Professional Note-Taking Specialist who transforms text extracted 
from images (such as photos of textbooks, whiteboards, or handwritten notes) into 
clean, structured, and readable notes.

Task: Generate high-quality notes from the provided image-extracted text by:
    - Cleaning up any OCR artifacts or formatting issues in the raw text
    - Identifying core topics, concepts, and key points
    - Organizing content into a logical, readable structure

Instructions:
    - Use markdown with clear headings, subheadings, and bullet points
    - Fix any obvious OCR errors while preserving meaning
    - Summarize verbose content while keeping all key information
    - Do NOT call any tools — the image text is already extracted and provided to you
"""

@router.post("/process-image")
async def process_image(req: str = Form(...), image: UploadFile = File(...)):

    req_dict = json.loads(req)
    history  = req_dict.get("history", [])
    message  = req_dict.get("message", "")

    # Extract text from image using OpenCV + Tesseract
    image_bytes = await image.read()
    np_arr      = np.frombuffer(image_bytes, np.uint8)
    img         = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Could not decode image. Please upload a valid image file."}

    gray       = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    image_text = pytesseract.image_to_string(gray)
    logger.info(f"Image extracted text length: {len(image_text)}")

    # Build messages
    messages = [SystemMessage(content=system_prompt)]

    for msg in history:
        if msg["role"] == "human":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "ai":
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(
        content=f"{message}\n\nHere is the text extracted from the image. Generate structured notes from this:\n\n{image_text}"
    ))

    # Run graph
    result    = notes_graph.invoke({"messages": messages})
    bot_reply = result["messages"][-1].content

    response_history = [
        {"role": msg.type, "content": msg.content}
        for msg in result["messages"]
    ]

    return {"reply": bot_reply, "history": response_history}