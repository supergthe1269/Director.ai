# 🎬 Director.ai

**Type a story premise. Get a cinematic shot list. Watch it play as a movie.**

Director.ai is an AI film-directing studio that turns a one-line story prompt into a
fully-directed cinematic sequence:

1. **Director** — Google Gemini breaks your prompt into 3–4 film shots (visuals, camera
   motion, dialogue) as structured JSON.
2. **Keyframes** — each shot gets an AI-generated cinematic still via Pollinations.ai.
3. **Playback** — a Remotion-powered player assembles the shots into an animated video
   with Ken Burns camera moves and dialogue overlays.

## ✨ Features

- 🎥 AI-generated cinematic shot list from a single text prompt
- 📸 AI keyframes per shot (Pollinations.ai image generation)
- 🎞️ Live video playback with real camera movement:
  - `Dolly In` / `Dolly Out` — push-in & pull-out (scale)
  - `Pan Left` / `Pan Right` — horizontal moves
  - `Tilt Up` / `Tilt Down` — vertical moves
  - `Static` — locked-off shot
- 💬 Dialogue subtitles with speaker attribution per shot
- 🖊️ Live-editable **Director Script (JSON)** — edit the shot list and the video re-renders instantly
- 🌑 Dark, professional studio UI

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  FRONTEND — Next.js 16 (App Router) + React 19 + Remotion      │
│                                                                │
│  app/page.tsx ── prompt ──▶ POST /api/generate                │
│       │                                                       │
│       ▼                                                       │
│  VideoPlayer ──▶ CinematicSequence ──▶ Shot (per shot)        │
│  (@remotion/player)                                           │
└──────────────────────────────┬─────────────────────────────────┘
                               │  http://localhost:8000
┌──────────────────────────────▼─────────────────────────────────┐
│  BACKEND — FastAPI (Python)                                    │
│                                                                │
│  POST /api/generate                                            │
│    ├─ Gemini → DirectorScript JSON (shots, camera, dialogue)   │
│    └─ Pollinations.ai → keyframe image URL per shot            │
└────────────────────────────────────────────────────────────────┘
```

### Data flow

```
Story prompt
   └─▶ Gemini (elite cinematic director) ──▶ DirectorScript JSON
          { sequence_id, fps: 30, shots: [
              { shot_id, duration_seconds, visual_description,
                camera_motion: { type }, dialogue?: { speaker, text },
                image_url }
          ]}
   └─▶ Pollinations.ai ──▶ 1280×720 cinematic keyframe per shot
   └─▶ Remotion Player ──▶ animated playback in the browser
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Remotion Player, lucide-react |
| Backend | FastAPI, Pydantic v2, Google GenAI SDK (`google-genai`) |
| Image Generation | Pollinations.ai (free, no API key) |
| LLM | Google Gemini |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/) (optional — the UI ships with a working demo sequence)

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Then create a `.env` file in `backend/`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

> The backend runs on **port 8000** — the frontend expects it there.

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — a demo cyberpunk sequence plays
immediately so you can see the engine working without the backend.

## 📡 API

### `POST /api/generate`

Takes a story premise and returns a directed shot script.

**Request:**

```json
{
  "prompt": "Astronauts exploring an alien cave"
}
```

**Response** (`DirectorScript`):

```json
{
  "sequence_id": "uuid",
  "fps": 30,
  "shots": [
    {
      "shot_id": 1,
      "duration_seconds": 3.0,
      "visual_description": "Astronauts descending into a glowing alien cave...",
      "camera_motion": { "type": "Dolly In" },
      "dialogue": { "speaker": "Commander", "text": "Bravo team, moving in." },
      "image_url": "https://image.pollinations.ai/prompt/..."
    }
  ]
}
```

**Camera motion types:** `Dolly In` · `Dolly Out` · `Pan Left` · `Pan Right` ·
`Tilt Up` · `Tilt Down` · `Static`

## 📁 Project Structure

```
Director.ai/
├── backend/
│   ├── main.py              # FastAPI app: /api/generate
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # GEMINI_API_KEY (local only, git-ignored)
└── frontend/
    ├── app/
    │   ├── page.tsx         # Studio UI (control panel + video viewport)
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   └── VideoPlayer.tsx  # Remotion <Player> wrapper
    ├── remotion/
    │   ├── CinematicSequence.tsx  # Shots sequenced + dialogue overlay
    │   └── Shot.tsx               # AI keyframe + camera motion animation
    └── package.json
```

## 🔒 Environment & Secrets

- `GEMINI_API_KEY` lives in `backend/.env` only — it is **git-ignored** and never
  committed. Do not commit `.env` files.
- The frontend calls the backend at the hardcoded `http://localhost:8000` (see
  `app/page.tsx`). Update this if your backend runs elsewhere.

## 📜 License

This project was built for **DevJams '26**.