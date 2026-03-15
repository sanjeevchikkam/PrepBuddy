import json
import logging
import fitz  # PyMuPDF

from fastapi import APIRouter, UploadFile, File, Form
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pydantic import BaseModel
from typing import List

from graph import job_search_graph

router = APIRouter()
logger = logging.getLogger(__name__)

system_prompt = """
Role: You are an expert Career Counselor and Job Search Specialist who analyzes 
student resumes and finds the most relevant current job opportunities.

Workflow - Follow these steps strictly in order:

    STEP 1 — Analyze the Resume:
        - Extract candidate's name, education, and graduation year
        - List all technical skills (languages, frameworks, tools)
        - List soft skills and any certifications
        - Note any internships, projects, or work experience
        - Determine experience level (fresher / junior / mid-level)

    STEP 2 — Search for Jobs:
        - Based on extracted skills, call the `search` tool multiple times with 
          targeted queries like:
            * "[primary skill] developer jobs 2025 fresher"
            * "[skill] + [skill] job openings hiring now"
            * "entry level [role] jobs for [degree] graduates"
        - Search at least 3-4 times with different skill combinations
        - Focus on roles the candidate is realistically eligible for

    STEP 3 — Present Job Recommendations:
        Structure your final response as:

        ## 👤 Resume Summary
        - Name, Degree, Experience Level
        - Top Skills identified

        ## 🔍 Job Roles You Should Apply For
        - List 2-4 specific job titles with why they match

        ## 💼 Current Job Openings Found
        For each job found via search:
            - Job Title
            - Company (if available)
            - Location / Remote
            - Required Skills match
            - Link (if available)

        ## 📝 Application Tips
        - 2-3 personalized tips based on their resume gaps or strengths

Instructions:
    - ALWAYS use the `search` tool before giving job recommendations
    - Never make up job listings — only recommend what search results return
    - Be encouraging and realistic about the candidate's profile
    - If resume text is unclear or incomplete, work with what's available
"""

@router.post("/job-search")
async def job_search(req: str = Form(...), resume: UploadFile = File(...)):

    try:
        req_dict = json.loads(req)
    except Exception as e:
        return {"error": f"Invalid JSON in req: {e}"}

    history = req_dict.get("history", [])
    message = req_dict.get("message", "Find me relevant jobs based on my resume.")

    # Extract text from resume PDF
    pdf_bytes   = await resume.read()
    doc         = fitz.open(stream=pdf_bytes, filetype="pdf")
    resume_text = "\n".join([page.get_text() for page in doc])
    logger.info(f"Resume extracted text length: {len(resume_text)}")

    if not resume_text.strip():
        return {"error": "Could not extract text from resume. Please upload a text-based PDF."}

    # Build messages
    messages = [SystemMessage(content=system_prompt)]

    for msg in history:
        if msg["role"] == "human":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "ai":
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(
        content=f"{message}\n\nHere is my resume:\n\n{resume_text}"
    ))

    # Run graph
    result    = job_search_graph.invoke({"messages": messages})
    bot_reply = result["messages"][-1].content

    response_history = [
        {"role": msg.type, "content": msg.content}
        for msg in result["messages"]
    ]

    return {"reply": bot_reply, "history": response_history}