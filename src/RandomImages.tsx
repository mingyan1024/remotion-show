import React, { useState } from "react";
import { getStaticFiles } from "@remotion/studio";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

type PhotoItem = {
  src: string;
  x: number;
  y: number;
  rotate: number;
  width: number;
  delay: number;
};

const imageFilePattern = /^random-images\/.+\.(png|jpe?g|webp|gif)$/i;

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const getRandomImageNames = () => {
  return getStaticFiles()
    .filter((file) => imageFilePattern.test(file.name))
    .map((file) => file.name)
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
};

const createLayout = (): PhotoItem[] => {
  return getRandomImageNames().map((name, index) => {
    return {
      src: staticFile(name),
      x: randomBetween(0, 1200),
      y: randomBetween(0, 700),
      rotate: randomBetween(-18, 18),
      width: randomBetween(700, 1000),
      delay: index * 6,
    };
  });
};

const PhotoCard: React.FC<{ photo: PhotoItem }> = ({ photo }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - photo.delay;

  const progress = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 1.2, 0.25, 1),
  });

  const settle = interpolate(localFrame, [0, 10, 18], [48, -12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.18, 0.9, 0.28, 1),
  });

  const scale = interpolate(localFrame, [0, 8, 16], [0.18, 1.12, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 1.1, 0.3, 1),
  });

  const floatOffset = Math.sin((frame + photo.delay * 3) / 14) * 5;

  return (
    <div
      style={{
        position: "absolute",
        left: photo.x,
        top: photo.y + settle + floatOffset,
        width: photo.width,
        opacity: progress,
        scale,
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

export const RandomImagesComposition: React.FC = () => {
  const [photos] = useState(createLayout);
  const frame = useCurrentFrame();
  const vignette = interpolate(frame, [0, 20, 60], [0, 0.2, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
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

