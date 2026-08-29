import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Shot } from "./Shot";

export interface DirectorScriptData {
  sequence_id: string;
  fps: number;
  shots: Array<{
    shot_id: number;
    duration_seconds: number;
    visual_description: string;
    camera_motion: {
      type: "Dolly In" | "Dolly Out" | "Pan Left" | "Pan Right" | "Tilt Up" | "Tilt Down" | "Static";
    };
    dialogue?: { speaker: string; text: string };
    image_url?: string;
  }>;
}

export const CinematicSequence: React.FC<{ script: DirectorScriptData }> = ({ script }) => {
  let accumulatedFrames = 0;
  const shots = script?.shots || [];

  return (
    <AbsoluteFill className="bg-black">
      {shots.map((shot) => {
        const shotFrames = Math.round((shot.duration_seconds || 3) * (script?.fps || 30));
        const fromFrame = accumulatedFrames;
        accumulatedFrames += shotFrames;

        return (
          <Sequence key={shot.shot_id} from={fromFrame} durationInFrames={shotFrames}>
            <Shot
              duration_seconds={shot.duration_seconds || 3}
              image_url={shot.image_url}
              camera_motion={shot.camera_motion}
              fps={script?.fps || 30}
            />
            {shot.dialogue?.text && (
              <AbsoluteFill className="justify-end items-center pb-10">
                <div className="bg-black/75 backdrop-blur border border-white/10 px-6 py-3 rounded-lg text-center max-w-[85%] shadow-2xl">
                  <span className="text-cyan-400 font-bold mr-2">{shot.dialogue.speaker}:</span>
                  <span className="text-white font-medium italic">"{shot.dialogue.text}"</span>
                </div>
              </AbsoluteFill>
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};