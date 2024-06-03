import React from "react";
import VolumeControls, { VolumeControlsProps } from "./VolumeControls";
import Fetcher from "../lib/Fetcher";
import { toast } from "react-toastify";
import { Loader } from "./Loader";

interface VideoPlayerProps {
  blobUrl: string;
}

function DownloadBlob({ blob }: { blob: Blob }) {
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (blob) {
      const file = new File([blob], "slice.mp4", { type: blob.type });
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [blob]);

  const handleClick = () => {
    if (linkRef.current) {
      linkRef.current.click();
    }
  };
  console.log("blobSliceUrl", url)

  return (
    <div>
      {url && (
        <a
          href={url}
          download="slice.mp4"
          ref={linkRef}
          style={{ display: "none" }}
        >
          Download slice
        </a>
      )}
      <button onClick={handleClick}>Download slice</button>
    </div>
  );
}

const VideoPlayer = ({ blobUrl }: VideoPlayerProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [volumeState, setVolumeState] =
    React.useState<VolumeControlsProps["state"]>("high");
  const [sliderVolume, setSliderVolume] = React.useState(1);
  const [inpoint, setInpoint] = React.useState(-1);
  const [outpoint, setOutpoint] = React.useState(-1);
  const [sliceLoading, setSliceLoading] = React.useState(false);
  const [blobSlice, setBlobSlice] = React.useState<Blob | null>(null);

  const markInpoint = (currentTime: number, videoDuration: number) => {
    if (currentTime > -1) {
      setInpoint(currentTime);
    }
    if (currentTime > outpoint) {
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
    if (!blobUrl) return;
    const video = videoRef.current;
    if (!video) return;

    const videoModel = new VideoPlayerModel(video);
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
      switch (e.key.toLowerCase()) {
        case " ":
          videoModel.togglePlay();
          break;
        case "i":
          // TODO: set inpoint
          markInpoint(
            videoModel.getPlaybackInfo().currentTime,
            videoModel.getPlaybackInfo().duration
          );
          break;
        case "o":
          // TODO: set outpoint
          markOutpoint(
            videoModel.getPlaybackInfo().currentTime,
            videoModel.getPlaybackInfo().duration
          );
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

  const downloadSlice = async () => {
    console.log("downloading slice ...");
    if (inpoint === -1 || outpoint === -1) {
      toast.error("Please set inpoint and outpoint");
      return;
    }
    setSliceLoading(true);
    const blob = await Fetcher.downloadVideoSlice(inpoint, outpoint);
    setSliceLoading(false);
    setBlobSlice(blob);
  };

  if (blobUrl === "") {
    return null;
  }

  return (
    <>
      <div className="video-container">
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
        </div>
        <video ref={videoRef}>
          <source src={blobUrl} type="video/mp4" />
        </video>
      </div>
      <div className="inpoint-outpoint-container space-y-4 pb-8">
        <p>Inpoint: {convertPointToNumber(inpoint)}</p>
        <p>Outpoint: {convertPointToNumber(outpoint)}</p>
        <button
          className="bg-black px-4 py-2 rounded-sm text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={downloadSlice}
          disabled={sliceLoading}
        >
          Create slice
        </button>
        {blobSlice && <DownloadBlob blob={blobSlice} />}
        {sliceLoading && <Loader />}
      </div>
    </>
  );
};

class VideoPlayerModel {
  public videoContainer = document.querySelector(".video-container")!!;
  public playPauseBtn = this.$("[data-action='play']") as HTMLButtonElement;
  public muteBtn = this.$(".mute-btn");
  public currentTimeElement = this.$(".current-time");
  public totalTimeElement = this.$(".total-time");
  private listenersToUnload: (() => void)[] = [];
  private _isMuted: boolean = false;
  private frameRate!: number | null;

  public get isMuted() {
    return this._isMuted;
  }

  public get volume() {
    return this.video.volume;
  }
  // private set
  constructor(private video: HTMLVideoElement) {
    this.playPauseBtn.textContent = "▶";
    this.assignEventListener("click", this.playPauseBtn, () => {
      this.togglePlay();
    });
    this.assignEventListener("click", this.video, () => {
      this.togglePlay();
    });
    this.assignVideoEventListener("loadeddata", () => {
      this.totalTimeElement.textContent = VideoPlayerModel.formatTimestamp(
        this.video.duration
      );
    });
    this.assignVideoEventListener("timeupdate", () => {
      this.currentTimeElement.textContent = VideoPlayerModel.formatTimestamp(
        this.video.currentTime
      );
    });
    (async () => {
      this.frameRate = await this.getFramerate();
    })();
  }

  private async getFramerate() {
    const data = await Fetcher.getFramerateOfVideo();
    if (data.success === true) {
      return data.frameRate;
    } else {
      return null;
    }
  }

  public togglePlay() {
    this.video.paused ? this.video.play() : this.video.pause();
    this.video.paused
      ? (this.playPauseBtn.textContent = "▶")
      : (this.playPauseBtn.textContent = "❚❚");
  }

  public toggleMute() {
    this.video.muted = !this.video.muted;
    if (this.video.volume === 0) {
      this.setMuted(true);
    }
    this._isMuted = this.video.muted;
    // console.groupCollapsed("toggleMute");
    // console.log("video.muted", this.video.muted);
    // console.log("isMuted", this._isMuted);
    // console.log("volume", this.video.volume);
    // console.groupEnd();
  }
  public setMuted(isMuted: boolean) {
    this.video.muted = isMuted;
    this._isMuted = isMuted;
  }

  public assignVideoEventListener(
    event: keyof HTMLVideoElementEventMap,
    func: () => void
  ) {
    this.video.addEventListener(event, func);
    this.listenersToUnload.push(() => {
      this.video.removeEventListener(event, func);
    });
  }

  public assignEventListener(
    event: string,
    element: Element,
    func: () => void
  ) {
    element.addEventListener(event, func);
    this.listenersToUnload.push(() => {
      element.removeEventListener(event, func);
    });
  }

  public getPlaybackInfo() {
    return {
      duration: this.video.duration,
      currentTime: this.video.currentTime,
    };
  }

  public removeListeners() {
    this.listenersToUnload.forEach((unload) => unload());
  }

  private $(selector: string) {
    return this.videoContainer.querySelector(selector)!!;
  }

  public static formatTimestamp(seconds: number, withMillis = false) {
    if (!withMillis) {
      const pad = (num: number) => String(num).padStart(2, "0");
      const preparedSeconds = Math.round(seconds);
      const hours = Math.floor(preparedSeconds / 3600);
      const minutes = Math.floor((preparedSeconds % 3600) / 60);
      const secs = preparedSeconds % 60;

      if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(secs)}`;
      } else {
        return `${minutes}:${pad(secs)}`;
      }
    } else {
      const pad = (num: number, size = 2) => String(num).padStart(size, "0");
      const milliseconds = Math.floor((seconds % 1) * 1000);
      const totalSeconds = Math.floor(seconds);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(secs)}.${pad(milliseconds, 3)}`;
      } else {
        return `${minutes}:${pad(secs)}.${pad(milliseconds, 3)}`;
      }
    }
  }
}

export default VideoPlayer;
