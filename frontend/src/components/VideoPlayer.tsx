import React from "react";
import VolumeControls, { VolumeControlsProps } from "./VolumeControls";
import Fetcher from "../lib/Fetcher";
import { toast } from "react-toastify";
import PlaybackSpeedControls from "./PlaybackSpeedControls";
import VideoPlayerModel from "./VideoPlayerModel";
import { useApplicationStore } from "../context/useApplication";

export class CSSVariablesManager<
  T extends Record<string, string | number> = Record<string, string>
> {
  constructor(private element: HTMLElement, defaultValues?: T) {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        this.set(key, value as T[keyof T]);
      });
    }
  }

  private formatName(name: string) {
    if (name.startsWith("--")) {
      return name;
    }
    return `--${name}`;
  }

  set<K extends keyof T>(name: K, value: T[K]) {
    this.element.style.setProperty(
      this.formatName(name as string),
      String(value)
    );
  }

  get(name: keyof T) {
    return this.element.style.getPropertyValue(this.formatName(name as string));
  }
}

interface VideoPlayerProps {
  blobUrl: string;
}

const VideoPlayer = ({ blobUrl }: VideoPlayerProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const videoModelRef = React.useRef<VideoPlayerModel | null>(null);
  const [volumeState, setVolumeState] =
    React.useState<VolumeControlsProps["state"]>("high");
  const [sliderVolume, setSliderVolume] = React.useState(1);
  const [inpoint, setInpoint] = React.useState(-1);
  const [outpoint, setOutpoint] = React.useState(-1);
  const [sliceLoading, setSliceLoading] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const { filePath } = useApplicationStore();

  function displayInpointOutpoint(inpoint: number, outpoint: number) {
    if (videoModelRef.current) {
      videoModelRef.current.setInpointOutpoint(inpoint, outpoint);
    }
  }

  const markInpoint = (currentTime: number, videoDuration: number) => {
    if (currentTime > -1) {
      setInpoint(currentTime);
    } else if (outpoint > -1 && currentTime > outpoint) {
      setInpoint(currentTime);
      setOutpoint(videoDuration);
    } else {
      setInpoint(0);
    }
  };

  const markOutpoint = (currentTime: number, videoDuration: number) => {
    if (currentTime > -1 && currentTime > inpoint) {
      setOutpoint(currentTime);
    } else if (currentTime < inpoint && currentTime > 0) {
      setInpoint(0);
      setOutpoint(currentTime);
    } else {
      setInpoint(0);
      setOutpoint(videoDuration);
    }
  };

  const convertPointToNumber = (num: number) => {
    if (num === -1) {
      return "--:--";
    } else {
      return VideoPlayerModel.formatTimestamp(num);
    }
  };

  const handleSliderVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      videoRef.current.volume = Number(e.target.value);
    }
  };

  React.useEffect(() => {
    displayInpointOutpoint(inpoint, outpoint);
  }, [inpoint, outpoint]);

  React.useEffect(() => {
    if (!blobUrl) return;
    const video = videoRef.current;
    if (!video) return;

    const videoModel = new VideoPlayerModel(video);
    videoModelRef.current = videoModel;
    videoModel.setFramerate(filePath);
    setSliderVolume(videoModel.volume);

    // clicking on mute button
    videoModel.assignEventListener("click", videoModel.muteBtn, () => {
      videoModel.toggleMute();
      if (videoModel.isMuted === true) {
        setVolumeState("muted");
      } else {
        videoModel.volume > 0.5
          ? setVolumeState("high")
          : setVolumeState("low");
      }
    });

    // the slider change event should change volume, which triggers this event.
    videoModel.assignVideoEventListener("volumechange", () => {
      setSliderVolume(videoModel.volume);
      if (videoModel.volume === 0 || videoModel.isMuted) {
        setVolumeState("muted");
        videoModel.setMuted(true);
      } else {
        videoModel.volume > 0.5
          ? setVolumeState("high")
          : setVolumeState("low");
      }
    });

    function setKeyBoardShortcuts(e: KeyboardEvent) {
      if (e.shiftKey && e.code === "ArrowRight") {
        e.preventDefault();
        videoModel.skip(1);
        return;
      }
      if (e.shiftKey && e.code === "ArrowLeft") {
        e.preventDefault();
        videoModel.skip(-1);
        return;
      }
      switch (e.key.toLowerCase()) {
        case " ":
          videoModel.togglePlay();
          break;
        case "i":
          console.log(inpoint, outpoint);

          markInpoint(
            videoModel.getPlaybackInfo().currentTime,
            videoModel.getPlaybackInfo().duration
          );

          break;
        case "o":
          markOutpoint(
            videoModel.getPlaybackInfo().currentTime,
            videoModel.getPlaybackInfo().duration
          );

          break;
        case "n":
          // TODO: go to next frame
          videoModel.nextFrame();
          break;
        case "b":
          // TODO: go back one frame
          videoModel.previousFrame();
          break;
        case "arrowleft":
          videoModel.skip(-5);
          break;
        case "arrowright":
          videoModel.skip(5);
          break;
      }
    }
    document.addEventListener("keydown", setKeyBoardShortcuts);

    // cleanup function
    return () => {
      videoModel.removeListeners();
      document.removeEventListener("keydown", setKeyBoardShortcuts);
    };
  }, [blobUrl]);

  function getCurrentFrame(currentTime: number, frameRate: number) {
    const currentFrame = Math.floor(currentTime * frameRate);
    return currentFrame;
  }

  async function downloadCurrentFrame() {
    const currentTime = videoRef.current?.currentTime;
    const frameRate = videoModelRef.current?.videoFrameRate;
    if (!currentTime || !frameRate) {
      toast.error("Failed to get current time and frame rate");
      return;
    }
    setSliceLoading(true);
    const blob = await Fetcher.downloadFrame(currentTime, filePath);
    if (!blob) {
      toast.error("Failed to download Frame");
      setSliceLoading(false);
      return;
    }

    const currentFrame = getCurrentFrame(currentTime, frameRate);
    const frameBlobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = frameBlobUrl;
    link.download = `frame-${currentFrame}.png`;
    setSliceLoading(false);
    link.click();
    URL.revokeObjectURL(frameBlobUrl);
  }

  const downloadSlice = async () => {
    console.log("downloading slice ...");
    if (inpoint === -1 || outpoint === -1) {
      toast.error("Please set inpoint and outpoint");
      return;
    }
    const blob = await Fetcher.downloadVideoSlice(inpoint, outpoint, filePath);
    setSliceLoading(true);
    if (!blob) {
      toast.error("Failed to create slice");
      setSliceLoading(false);
      return;
    }

    const sliceBlobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = sliceBlobUrl;
    link.download = "slice.mp4";
    link.click();
    URL.revokeObjectURL(sliceBlobUrl);
    setSliceLoading(false);
  };

  if (blobUrl === "") {
    return null;
  }

  return (
    <>
      <div className="video-container">
        <div className="timeline-container">
          <div className="timeline">
            <img className="preview-img" />
            <div className="thumb-indicator"></div>
            <div className="inpoint-indicator">I</div>
            <div className="outpoint-indicator">O</div>
          </div>
        </div>
        <div className="video-controls">
          <button data-action="play" className="paused"></button>
          <VolumeControls
            state={volumeState}
            sliderVolume={sliderVolume}
            onSliderVolumeChange={handleSliderVolumeChange}
          />
          <div className="duration-container">
            <div className="current-time">0:00</div>/
            <div className="total-time"></div>
          </div>
          <PlaybackSpeedControls
            speed={speed}
            onSpeedChange={(num: number) => {
              setSpeed(num);
              if (videoRef.current) {
                videoRef.current.playbackRate = num;
              }
            }}
          />
        </div>
        <video ref={videoRef}>
          <source src={blobUrl} type="video/mp4" />
        </video>
      </div>
      <div className="inpoint-outpoint-container space-y-4">
        <p>Inpoint: {convertPointToNumber(inpoint)}</p>
        <p>Outpoint: {convertPointToNumber(outpoint)}</p>
        <button
          className="bg-black px-4 block py-2 rounded-sm text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={downloadCurrentFrame}
          disabled={sliceLoading}
        >
          Download current Frame
        </button>
        <button
          className="bg-black px-4 block py-2 rounded-sm text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={downloadSlice}
          disabled={sliceLoading}
        >
          Download slice
        </button>
      </div>
      <div className="shortcuts py-8 max-w-[1000px] mx-auto px-4">
        <p>
          Press <kbd>n</kbd> to go to next frame
        </p>
        <p>
          Press <kbd>b</kbd> to go to previous frame
        </p>
        <p>
          Press <kbd>i</kbd> to set inpoint
        </p>
        <p>
          Press <kbd>o</kbd> to set outpoint
        </p>
      </div>
    </>
  );
};

export default VideoPlayer;
