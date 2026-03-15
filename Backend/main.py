import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import pdf_notes, image_notes, audio_notes, yt_notes, text_notes, career, job_search

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="PrepBuddy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers under /prepbuddy prefix
app.include_router(pdf_notes.router,   prefix="/prepbuddy")
app.include_router(image_notes.router, prefix="/prepbuddy")
app.include_router(audio_notes.router, prefix="/prepbuddy")
app.include_router(yt_notes.router,    prefix="/prepbuddy")
app.include_router(text_notes.router,  prefix="/prepbuddy")
app.include_router(career.router,      prefix="/prepbuddy")
app.include_router(job_search.router,  prefix="/prepbuddy")

@app.get("/")
async def welcome():
    return {"message": "Welcome to StudyBuddy API!"}