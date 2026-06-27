import "./index.css";
import { Composition } from "remotion";
import { ImagesDuangComposition } from "./ImagesDuang";
import { RandomImagesComposition } from "./RandomImages";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ImagesDuangComp"
        component={ImagesDuangComposition}
        durationInFrames={100}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="RandomImagesComp"
        component={RandomImagesComposition}
        durationInFrames={100}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
