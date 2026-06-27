import React from "react";
import {
  AbsoluteFill,
  Img,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

type PhotoItem = {
  src: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
  width: number;
};

const photos: PhotoItem[] = [
  { src: staticFile("images-duang/1.png"), x: 140, y: 110, rotate: -12, delay: 0, width: 450 },
  { src: staticFile("images-duang/2.png"), x: 460, y: 70, rotate: 8, delay: 6, width: 430 },
  { src: staticFile("images-duang/3.png"), x: 760, y: 160, rotate: -6, delay: 12, width: 460 },
  { src: staticFile("images-duang/4.png"), x: 250, y: 330, rotate: 10, delay: 18, width: 480 },
  { src: staticFile("images-duang/5.png"), x: 650, y: 330, rotate: -9, delay: 24, width: 440 },
];

const PhotoCard: React.FC<{ photo: PhotoItem }> = ({ photo }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - photo.delay;

  const progress = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 1.2, 0.25, 1),
  });

  const settle = interpolate(localFrame, [0, 10, 18], [34, -8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 1, 0.3, 1),
  });

  const wobble = interpolate(localFrame, [0, 8, 16], [0.96, 1.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.17, 0.84, 0.44, 1),
  });

  const floatOffset = Math.sin((frame + photo.delay * 2) / 12) * 6;

  return (
    <div
      style={{
        position: "absolute",
        left: photo.x,
        top: photo.y + settle + floatOffset,
        width: photo.width,
        opacity: progress,
        scale: progress * wobble,
        rotate: `${photo.rotate * progress}deg`,
        filter: "drop-shadow(0 18px 35px rgba(0, 0, 0, 0.35))",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          padding: 10,
          borderRadius: 18,
          boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
          transform: "translateZ(0)",
        }}
      >
        <Img
          src={photo.src}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: 12,
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
};

export const ImagesDuangComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const vignette = interpolate(frame, [0, 20, 60], [0, 0.2, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "transparent",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 760,
          height: 420,
          transform: "translate(-50%, -50%)",
          borderRadius: 32,
          background: "rgba(255,255,255,0.06)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.1) inset",
          filter: `blur(${interpolate(frame, [0, 30], [18, 0], { extrapolateRight: "clamp" })}px)`,
        }}
      />
      {photos.map((photo) => (
        <PhotoCard key={photo.src} photo={photo} />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 120px rgba(0,0,0,${vignette})`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
