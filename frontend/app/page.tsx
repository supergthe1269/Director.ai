"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DirectorScriptData } from "../remotion/CinematicSequence";
import { Clapperboard, SlidersHorizontal, Wand2, Film } from "lucide-react";

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
      image_url:
        "https://image.pollinations.ai/prompt/cyberpunk%20rainy%20neon%20alley%20cinematic%208k?width=1280&height=720&nologo=true&seed=1",
    },
    {
      shot_id: 2,
      duration_seconds: 3.5,
      visual_description: "Futuristic detective stepping out of shadows",
      camera_motion: { type: "Pan Right" },
      dialogue: { speaker: "Detective", text: "I'm moving in now." },
      image_url:
        "https://image.pollinations.ai/prompt/futuristic%20detective%20trenchcoat%20shadows%20cinematic?width=1280&height=720&nologo=true&seed=2",
    },
  ],
};

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<DirectorScriptData>(DEFAULT_SCRIPT);
  const [scriptText, setScriptText] = useState(JSON.stringify(DEFAULT_SCRIPT, null, 2));
  const [isMounted, setIsMounted] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setConnectionError(false);
    try {
      const res = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setScript(data);
      setScriptText(JSON.stringify(data, null, 2));
    } catch (err) {
      setConnectionError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleScriptEdit = (value: string) => {
    setScriptText(value);
    try {
      const parsed = JSON.parse(value);
      if (parsed && Array.isArray(parsed.shots)) {
        setScript(parsed);
      }
    } catch {
      // Ignore invalid syntax while typing
    }
  };

  const activeDialogue = script.shots?.[0]?.dialogue;

  return (
    <div className="app-shell">
      <div className="sprocket-rail" />

      <header className="top-bar">
        <div className="brand">
          <img src="/favicon.ico" className="h-6 w-6"/>
          <span>
            Director<span className="brand-accent">.ai</span>
          </span>
        </div>
        <span className="badge-gold">
          <Film size={12} /> Studio
        </span>
      </header>

      <div className="grid gap-6 p-5 lg:grid-cols-2 lg:gap-8 lg:p-8">
        {/* ---------------------------------------------------------------
             LEFT COLUMN — premise input + live director script
           --------------------------------------------------------------- */}
        <section className="flex flex-col gap-6 min-h-0">
          <div className="panel">
            <div className="panel-header">
              <Wand2 size={13} /> Scene Premise
            </div>
            <div className="panel-body">
              <div className="prompt-bar !p-0 !flex-col sm:!flex-row">
                <input
                  className="input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="Describe your scene premise (e.g. Astronauts exploring an alien cave)..."
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt}
                  className="btn btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Directing…" : "Generate"}
                </button>
              </div>

              {connectionError && (
                <p
                  className="mt-3 text-[13px]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Couldn&apos;t reach the director engine — make sure the FastAPI
                  backend is running on port 8000. Editing the script below still
                  works.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-1 min-h-0 flex-col gap-3">
            <span className="eyebrow flex items-center gap-2">
              <SlidersHorizontal size={13} /> Live Programmable Director Script (JSON)
            </span>

            <div className="screen flex flex-1 min-h-[360px] flex-col lg:min-h-0">
              <div className="screen-header">
                <span>{script.sequence_id || "untitled_sequence"}.json</span>
                <span
                  className="ml-auto text-[11px] normal-case tracking-normal"
                  style={{ color: "var(--screen-text-soft)" }}
                >
                  {script.fps ?? 30} fps · {script.shots?.length ?? 0} shots
                </span>
              </div>
              <textarea
                spellCheck={false}
                value={scriptText}
                onChange={(e) => handleScriptEdit(e.target.value)}
                className="screen-body scroll-gold flex-1 w-full resize-none bg-transparent outline-none border-0"
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
             RIGHT COLUMN — preview
           --------------------------------------------------------------- */}
        <section className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Preview</span>
            <span className="badge-gold">{script.shots?.length ?? 0} Shots</span>
          </div>

          <div className="preview-frame flex-1 min-h-[320px] lg:min-h-0">
            <div className="preview-frame__inner relative flex h-full min-h-[300px] items-center justify-center">
              {isMounted ? (
                <VideoPlayer script={script} />
              ) : (
                <div
                  className="text-[13px]"
                  style={{ color: "var(--screen-text-soft)" }}
                >
                  Initializing video engine…
                </div>
              )}

              {activeDialogue && (
                <div className="dialogue-chip">
                  <span className="speaker">{activeDialogue.speaker}:</span>
                  &ldquo;{activeDialogue.text}&rdquo;
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
