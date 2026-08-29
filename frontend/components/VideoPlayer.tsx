"use client";
import React from "react";
import { Player } from "@remotion/player";
import { CinematicSequence, DirectorScriptData } from "../remotion/CinematicSequence";

export default function VideoPlayer({ script }: { script: DirectorScriptData }) {
  const totalFrames = Math.max(
    1,
    Math.round(
      (script?.shots ?? []).reduce((acc, s) => acc + (s?.duration_seconds || 0), 0) * (script?.fps || 30)
    )
  );

  return (
    <Player
      component={CinematicSequence}
      inputProps={{ script }}
      durationInFrames={totalFrames}
      compositionWidth={1280}
      compositionHeight={720}
      fps={script?.fps || 30}
      controls
      autoPlay
      loop
      style={{ width: "100%", height: "100%" }}
    />
  );
}