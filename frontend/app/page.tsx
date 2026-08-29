"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DirectorScriptData } from "../remotion/CinematicSequence";
import { Sparkles, Sliders } from "lucide-react";

// Dynamically import the isolated VideoPlayer component
const VideoPlayer = dynamic(() => import("../components/VideoPlayer"), {
  ssr: false,
});

const DEFAULT_SCRIPT: DirectorScriptData = {
  sequence_id: "demo_init",
  fps: 30,
  shots: [
    {
      shot_id: 1,
      duration_seconds: 3.0,
      visual_description: "Cyberpunk alley in the rain with glowing neon signs",
      camera_motion: { type: "Dolly In" },
      dialogue: { speaker: "Operator", text: "Target visual confirmed at waypoint alpha." },
      image_url: "https://image.pollinations.ai/prompt/cyberpunk%20rainy%20neon%20alley%20cinematic%208k?width=1280&height=720&nologo=true&seed=1"
    },
    {
      shot_id: 2,
      duration_seconds: 3.5,
      visual_description: "Futuristic detective stepping out of shadows",
      camera_motion: { type: "Pan Right" },
      dialogue: { speaker: "Detective", text: "I'm moving in now." },
      image_url: "https://image.pollinations.ai/prompt/futuristic%20detective%20trenchcoat%20shadows%20cinematic?width=1280&height=720&nologo=true&seed=2"
    }
  ]
};

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<DirectorScriptData>(DEFAULT_SCRIPT);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setScript(data);
    } catch (err) {
      alert("Failed to connect to backend engine. Ensure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-screen bg-neutral-950 text-neutral-100">
      {/* Left Control Panel */}
      <section className="w-1/2 p-6 flex flex-col gap-4 border-r border-neutral-800 overflow-y-auto">
        <header className="flex items-center gap-2">
          <Sparkles className="text-cyan-400" />
          <h1 className="text-xl font-black tracking-tight">Director.ai Studio</h1>
        </header>

        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your scene premise (e.g. Astronauts exploring an alien cave)..."
            className="flex-1 bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Directing..." : "Generate"}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mt-2">
          <Sliders size={14} /> Live Programmable Director Script (JSON)
        </div>

        <textarea
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono text-xs text-neutral-300 leading-relaxed focus:outline-none focus:border-neutral-700 resize-none"
          value={JSON.stringify(script, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              if (parsed && Array.isArray(parsed.shots)) {
                setScript(parsed);
              }
            } catch {
              // Ignore invalid syntax while typing
            }
          }}
        />
      </section>

      {/* Right Canvas Player Viewport */}
      <section className="w-1/2 p-6 flex flex-col justify-center items-center bg-black">
        <div className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900 flex items-center justify-center">
          {isMounted ? (
            <VideoPlayer script={script} />
          ) : (
            <div className="text-neutral-500 text-sm">Initializing Video Engine...</div>
          )}
        </div>
      </section>
    </main>
  );
}