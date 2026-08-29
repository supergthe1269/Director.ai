# 🎬 Director.ai — Frontend

The Next.js studio UI for **Director.ai**. Turns a story prompt (and the `DirectorScript`
JSON produced by the backend) into a **live cinematic preview** powered by Remotion.

## What's in here

| File | Purpose |
|---|---|
| `app/page.tsx` | Main studio screen — control panel (prompt + editable Director Script JSON) on the left, video viewport on the right |
| `app/layout.tsx` | Root layout with Geist fonts |
| `components/VideoPlayer.tsx` | Wraps the Remotion `<Player>`, computes total frames from the script |
| `remotion/CinematicSequence.tsx` | Sequenced shots with dialogue overlay bubbles |
| `remotion/Shot.tsx` | Renders one AI keyframe with Ken Burns style camera motion |
| `app/globals.css` | Tailwind CSS v4 entry |

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, TypeScript, React 19)
- **[Remotion](https://www.remotion.dev)** `<Player>` — browser-based video rendering
- **Tailwind CSS 4** — styling
- **lucide-react** — icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

A built-in **demo cyberpunk sequence** (`DEFAULT_SCRIPT` in `app/page.tsx`) plays
immediately, so the UI works even if the backend isn't running.

## Working with the backend

The "Generate" button sends your prompt to the FastAPI backend:

```
POST http://localhost:8000/api/generate
{ "prompt": "<your story premise>" }
```

The returned `DirectorScript` JSON replaces the current script, and the video
re-renders instantly.

> The backend URL is hardcoded in `app/page.tsx`. Update it there if your backend
> runs on a different host/port. See the [root README](../README.md) for backend setup.

## Editing the director script live

The left-side control panel shows the live script as JSON. Edit it in place:

- Shots are the `shots[]` array — each has `duration_seconds`, `visual_description`,
  `camera_motion.type`, optional `dialogue`, and `image_url`.
- Camera motion types: `Dolly In` · `Dolly Out` · `Pan Left` · `Pan Right` ·
  `Tilt Up` · `Tilt Down` · `Static`
- Invalid JSON while typing is ignored; valid JSON re-renders the preview.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

This is the frontend of the **Director.ai** project — see the [root README](../README.md)
for the full picture (architecture, backend, API, data flow).
