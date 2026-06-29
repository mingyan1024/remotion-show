import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

type Chapter = {
  index: number;
  title: string;
  startSeconds: number;
  endSeconds: number;
};

type ProgressConfig = {
  fps: number;
  chapters: Chapter[];
};

const fallbackConfigText = `fps=30

[chapters]
1=demo开场介绍,00:00,00:35
2=demo主要话题,00:35,00:47
3=demo详细说明,00:47,01:28
4=demo总结,01:28,01:50`;

const parseTimestamp = (value: string) => {
  const [minutes, seconds] = value.trim().split(":").map(Number);

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    throw new Error(`Invalid timestamp: ${value}`);
  }

  return minutes * 60 + seconds;
};

export const parseProgressIni = (iniText: string): ProgressConfig => {
  const lines = iniText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith(";") && !line.startsWith("#"));

  let section = "";
  let fps = 30;
  const chapters: Chapter[] = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^\[(.+)\]$/);

    if (sectionMatch) {
      section = sectionMatch[1].toLowerCase();
      continue;
    }

    const equalIndex = line.indexOf("=");

    if (equalIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalIndex).trim();
    const value = line.slice(equalIndex + 1).trim();

    if (section === "" && key.toLowerCase() === "fps") {
      const parsedFps = Number(value);
      fps = Number.isFinite(parsedFps) && parsedFps > 0 ? parsedFps : fps;
      continue;
    }

    if (section === "chapters") {
      const [title, start, end] = value.split(",").map((part) => part.trim());

      if (!title || !start || !end) {
        throw new Error(`Invalid chapter row: ${line}`);
      }

      chapters.push({
        index: Number(key),
        title,
        startSeconds: parseTimestamp(start),
        endSeconds: parseTimestamp(end),
      });
    }
  }

  return {
    fps,
    chapters: chapters.sort((a, b) => a.index - b.index),
  };
};

export const getTechProgressBarMetadata = async () => {
  const response = await fetch(staticFile("progress.ini"));
  const config = parseProgressIni(await response.text());
  const lastChapter = config.chapters.at(-1);

  return {
    durationInFrames: Math.ceil((lastChapter?.endSeconds ?? 0) * config.fps),
    fps: config.fps,
  };
};

const useProgressConfig = () => {
  const [config, setConfig] = useState(() => parseProgressIni(fallbackConfigText));

  useEffect(() => {
    const handle = delayRender("Loading progress.ini");

    fetch(staticFile("progress.ini"))
      .then((response) => response.text())
      .then((text) => setConfig(parseProgressIni(text)))
      .catch(() => setConfig(parseProgressIni(fallbackConfigText)))
      .finally(() => continueRender(handle));
  }, []);

  return config;
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

export const TechProgressBarComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const progressConfig = useProgressConfig();

  const totalSeconds = progressConfig.chapters.at(-1)?.endSeconds ?? 1;
  const currentSeconds = frame / progressConfig.fps;
  const progress = Math.min(currentSeconds / totalSeconds, 1);

  const activeChapter = useMemo(() => {
    return (
      progressConfig.chapters.find(
        (chapter) =>
          currentSeconds >= chapter.startSeconds && currentSeconds < chapter.endSeconds,
      ) ?? progressConfig.chapters.at(-1)
    );
  }, [currentSeconds, progressConfig.chapters]);

  const reveal = interpolate(frame, [0, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const pulse = 0.55 + Math.sin(frame / 8) * 0.2;

  return (
    <AbsoluteFill
      style={{
        background:
          "transparent",
        color: "#e9f7ff",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(46, 178, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(46, 178, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
          maskImage: "radial-gradient(circle at center, black 0%, transparent 72%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 330,
          opacity: reveal,
          translate: `0 ${interpolate(frame, [0, 28], [34, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px`,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 28,
            marginBottom: 24,
            minHeight: 110,
          }}
        >
          {progressConfig.chapters.map((chapter) => {
            const left = (chapter.startSeconds / totalSeconds) * 100;
            const width =
              ((chapter.endSeconds - chapter.startSeconds) / totalSeconds) * 100;
            const isActive = chapter.index === activeChapter?.index;
            const isPassed = currentSeconds >= chapter.endSeconds;

            return (
              <div
                key={chapter.index}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  width: `${width}%`,
                  bottom: -20,
                  display: "flex",
                  justifyContent: "center",
                  padding: "0 14px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    color: isActive ? "#ffffff" : isPassed ? "#7de7ff" : "#88a9cb",
                    fontSize: isActive ? 20 : 14,
                    fontWeight: 700,
                    lineHeight: 1.12,
                    textAlign: "center",
                    textShadow: isActive
                      ? `0 0 ${18 + pulse * 14}px rgba(105, 220, 255, 0.9)`
                      : "0 0 14px rgba(34, 130, 210, 0.35)",
                    opacity: isActive ? 1 : 0.82,
                  }}
                >
                  {chapter.title}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: "relative",
            height: 10,
            borderRadius: 8,
            background: "rgba(4, 18, 42, 0.96)",
            border: "1px solid rgba(109, 220, 255, 0.42)",
            boxShadow:
              "0 0 0 1px rgba(15, 112, 196, 0.35) inset, 0 0 46px rgba(19, 151, 255, 0.24)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent, rgba(119, 230, 255, 0.14), transparent)",
              translate: `${interpolate(frame % 90, [0, 90], [-100, 100])}% 0`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress * 100}%`,
              background:
                "linear-gradient(90deg, #0d68ff 0%, #12d8ff 62%, #d5fbff 100%)",
              boxShadow: `0 0 ${28 + pulse * 22}px rgba(42, 217, 255, 0.8)`,
            }}
          />
          {progressConfig.chapters.slice(1).map((chapter) => (
            <div
              key={chapter.index}
              style={{
                position: "absolute",
                left: `${(chapter.startSeconds / totalSeconds) * 100}%`,
                top: -8,
                bottom: -8,
                width: 3,
                background:
                  "linear-gradient(180deg, transparent, rgba(230, 252, 255, 0.95), transparent)",
                boxShadow: "0 0 16px rgba(139, 239, 255, 0.9)",
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
