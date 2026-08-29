import os
import json
import urllib.parse
from typing import List, Literal, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="Director.ai Backend Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Pydantic Schemas
class CameraMotion(BaseModel):
    type: Literal["Dolly In", "Dolly Out", "Pan Left", "Pan Right", "Tilt Up", "Tilt Down", "Static"]

class Dialogue(BaseModel):
    speaker: str
    text: str

class Shot(BaseModel):
    shot_id: int
    duration_seconds: float = Field(default=3.0, description="Duration between 2.5 and 4.5 seconds")
    visual_description: str = Field(description="Detailed image prompt for diffusion generator")
    camera_motion: CameraMotion
    dialogue: Optional[Dialogue] = None
    image_url: Optional[str] = None

class DirectorScript(BaseModel):
    sequence_id: str
    fps: int = 30
    shots: List[Shot]

class StoryRequest(BaseModel):
    prompt: str

@app.post("/api/generate", response_model=DirectorScript)
async def generate_director_script(request: StoryRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY is not set. Please check your .env file."
        )

    client = genai.Client(api_key=api_key)

    system_instruction = (
        "You are an elite cinematic film director. Decompose the user's story prompt into "
        "a sequence of 3 to 4 visually compelling cinematic shots. "
        "Return ONLY a valid JSON object matching this schema:\n"
        "{\n"
        '  "sequence_id": "string",\n'
        '  "fps": 30,\n'
        '  "shots": [\n'
        "    {\n"
        '      "shot_id": 1,\n'
        '      "duration_seconds": 3.0,\n'
        '      "visual_description": "detailed scene description",\n'
        '      "camera_motion": {"type": "Dolly In" | "Dolly Out" | "Pan Left" | "Pan Right" | "Tilt Up" | "Tilt Down" | "Static"},\n'
        '      "dialogue": {"speaker": "Name", "text": "speech line"}\n'
        "    }\n"
        "  ]\n"
        "}"
    )

    try:
        # Pass model and contents directly
        response = client.models.generate_content(
            model="gemini-3.6-flash",  # <-- Update this line
            contents=request.prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.7,
            ),
        )

        # Parse the JSON response
        raw_text = response.text.strip()
        data = json.loads(raw_text)

        # Validate with Pydantic
        script = DirectorScript(**data)

        # Attach instant keyframe image URLs via Pollinations.ai
        for shot in script.shots:
            clean_prompt = f"cinematic film still, 8k, dramatic lighting, {shot.visual_description}"
            encoded = urllib.parse.quote(clean_prompt)
            shot.image_url = f"https://image.pollinations.ai/prompt/{encoded}?width=1280&height=720&nologo=true&seed={shot.shot_id * 37}"

        return script

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation Error: {str(e)}")