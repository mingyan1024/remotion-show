import "./index.css";
import { Composition } from "remotion";
import { ImagesDuangComposition } from "./ImagesDuang";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ImagesDuangComp"
        component={ImagesDuangComposition}
        durationInFrames={100}
        fps={60}
        width={1280}
        height={720}
      />
    </>
  );
};
