import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export interface ShotProps {
  duration_seconds: number;
  image_url?: string;
  camera_motion: {
    type: "Dolly In" | "Dolly Out" | "Pan Left" | "Pan Right" | "Tilt Up" | "Tilt Down" | "Static";
  };
  fps: number;
}

export const Shot: React.FC<ShotProps> = ({ duration_seconds, image_url, camera_motion, fps }) => {
  const frame = useCurrentFrame();
  const totalFrames = Math.max(1, Math.round(duration_seconds * fps));
  const motion = camera_motion?.type || "Static";

  const scale = interpolate(
    frame,
    [0, totalFrames],
    motion === "Dolly In" ? [1.0, 1.25] : motion === "Dolly Out" ? [1.25, 1.0] : [1.1, 1.1],
    { extrapolateRight: "clamp" }
  );

  const translateX = interpolate(
    frame,
    [0, totalFrames],
    motion === "Pan Left" ? [50, -50] : motion === "Pan Right" ? [-50, 50] : [0, 0],
    { extrapolateRight: "clamp" }
  );

  const translateY = interpolate(
    frame,
    [0, totalFrames],
    motion === "Tilt Down" ? [-30, 30] : motion === "Tilt Up" ? [30, -30] : [0, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill className="bg-black overflow-hidden">
      {image_url && (
        <img
          src={image_url}
          alt="Scene Keyframe"
          className="w-full h-full object-cover"
          style={{
            transformOrigin: "center center",
            transform: `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};