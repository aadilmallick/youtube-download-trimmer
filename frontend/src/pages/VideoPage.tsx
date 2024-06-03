import { useApplicationStore } from "../context/useApplication";
import { Navigate } from "react-router-dom";
import Fetcher from "../lib/Fetcher";
import React from "react";
import { create } from "zustand";
import { set } from "zod";
import VideoPlayer from "../components/VideoPlayer";

type Store = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export const useAPILoading = create<Store>()((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));

const VideoPage = () => {
  const { uploaded, setBlobUrl, blobUrl } = useApplicationStore();
  if (!uploaded) {
    return <Navigate to="/" />;
  }

  const [message, setMessage] = React.useState("");
  const onCompress = async () => {
    const data = await Fetcher.compressVideo();
    if (data.success === true) {
      setMessage("Compression finished. Now downloading...");
      await onDownload();
    } else {
      setMessage(data.error || "Failed to compress video");
    }
  };

  const onDownload = async () => {
    const blob = await Fetcher.downloadVideo();
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
    </section>
  );
};

const CompressButton = ({ onCompress }: { onCompress: () => void }) => {
  const { loading, setLoading } = useAPILoading();

  return (
    <button
      className="bg-black text-white font-semibold px-4 py-2 w-full text-center rounded-md focus:ring-blue-300 focus:ring-2"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        onCompress();
        setLoading(false);
      }}
    >
      Compress First
    </button>
  );
};

const DownloadButton = ({ onDownload }: { onDownload: () => void }) => {
  const { loading, setLoading } = useAPILoading();

  return (
    <button
      className="bg-black text-white font-semibold px-4 py-2 w-full text-center rounded-md focus:ring-blue-300 focus:ring-2"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        onDownload();
        setLoading(false);
      }}
    >
      Let's Trim!
    </button>
  );
};

export default VideoPage;
