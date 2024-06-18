import { useApplicationStore } from "../context/useApplication";
import { Navigate, useNavigate } from "react-router-dom";
import Fetcher from "../lib/Fetcher";
import React from "react";

import VideoPlayer from "../components/VideoPlayer";
import { useAPILoading } from "../hooks/useAPILoading";

const VideoPage = () => {
  const { uploaded, setBlobUrl, blobUrl, filePath, setFilePath } =
    useApplicationStore();
  const [message, setMessage] = React.useState("");
  if (!uploaded || !filePath) {
    return <Navigate to="/" />;
  }

  const onCompress = async () => {
    const data = await Fetcher.compressVideo(filePath);
    if (data.success === true) {
      setMessage("Compression finished. Now downloading...");
      setFilePath(data.filePath);
      await onDownload();
    } else {
      setMessage(data.error || "Failed to compress video");
    }
  };

  const onDownload = async () => {
    console.log("downloading at filepath");
    const blob = await Fetcher.downloadVideo(filePath);
    if (!blob) {
      setMessage("Download failed");
    } else {
      const blobUrl = URL.createObjectURL(blob);
      setBlobUrl(blobUrl);
    }
  };

  const BeforeVideoDownloadedContent = () => {
    if (!blobUrl) {
      return (
        <div className="max-w-[25rem] shadow-lg rounded-lg bg-white py-4 px-8 space-y-4 mx-auto">
          <h1 className="text-3xl font-bold text-center">Choose options</h1>
          <CompressButton onCompress={onCompress} />
          <DownloadButton onDownload={onDownload} />
          <p className="max-w-[75ch] mx-auto">{message}</p>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <section className="h-screen pt-24">
      {BeforeVideoDownloadedContent()}
      <VideoPlayer blobUrl={blobUrl} />
      <ClearVideoButton />
    </section>
  );
};

const ClearVideoButton = () => {
  const { loading, setLoading } = useAPILoading();
  const { clearStore, filePath } = useApplicationStore();
  const navigate = useNavigate();

  if (!filePath) {
    return null;
  }

  return (
    <button
      className="bg-black text-white font-semibold px-4 py-2 text-center rounded-md focus:ring-blue-300 focus:ring-2 absolute top-4 right-4 z-50 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const data = await Fetcher.clearVideos(filePath);
        console.log(data);
        clearStore();
        setLoading(false);
        navigate("/");
      }}
    >
      Clear Videos
    </button>
  );
};

const CompressButton = ({
  onCompress,
}: {
  onCompress: () => Promise<void>;
}) => {
  const { loading, setLoading } = useAPILoading();

  return (
    <button
      className="bg-black text-white font-semibold px-4 py-2 w-full text-center rounded-md focus:ring-blue-300 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await onCompress();
        setLoading(false);
      }}
    >
      Compress First
    </button>
  );
};

const DownloadButton = ({
  onDownload,
}: {
  onDownload: () => Promise<void>;
}) => {
  const { loading, setLoading } = useAPILoading();

  return (
    <button
      className="bg-black text-white font-semibold px-4 py-2 w-full text-center rounded-md focus:ring-blue-300 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await onDownload();
        setLoading(false);
      }}
    >
      Let's Trim!
    </button>
  );
};

export default VideoPage;
