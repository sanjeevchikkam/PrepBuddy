import os
import json
import logging
import tempfile
import assemblyai as aai

from fastapi import APIRouter, UploadFile, File, Form
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from graph import notes_graph

router = APIRouter()
logger = logging.getLogger(__name__)

aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY1")

system_prompt = """
Role: You are a Professional Conversation & Audio Summarizer who transforms 
transcribed audio content into clear, concise, and well-structured summaries.

Task: Analyze the provided audio transcript and generate a comprehensive summary by:
    - Identifying the main topic and purpose of the conversation or recording
    - Extracting key points, decisions, and action items
    - Preserving important names, dates, and facts mentioned

Instructions:
    - Structure the summary with an Overview section followed by Key Points
    - Use bullet points for easy scanning
    - Maintain a neutral, professional tone
    - If it's a lecture or tutorial, format it as structured notes instead
    - Do NOT call any tools — the transcript is already extracted and provided to you
"""

@router.post("/process-audio")
async def process_audio(req: str = Form(...), audio: UploadFile = File(...)):

    try:
        req_dict = json.loads(req)
    except Exception as e:
        return {"error": f"Invalid JSON in req: {e}"}

    history = req_dict.get("history", [])
    message = req_dict.get("message", "")

    # Save audio to temp file and transcribe
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    transcriber  = aai.Transcriber()
    transcript   = transcriber.transcribe(tmp_path)
    audio_text   = transcript.text
    logger.info(f"Audio transcribed text length: {len(audio_text)}")

    # Build messages
    messages = [SystemMessage(content=system_prompt)]

    for msg in history:
        if msg["role"] == "human":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "ai":
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(
        content=f"{message}\n\nHere is the transcript from the audio file. Summarize this clearly:\n\n{audio_text}"
    ))

    # Run graph
    result    = notes_graph.invoke({"messages": messages})
    bot_reply = result["messages"][-1].content

    response_history = [
        {"role": msg.type, "content": msg.content}
        for msg in result["messages"]
    ]

    return {"reply": bot_reply, "history": response_history}