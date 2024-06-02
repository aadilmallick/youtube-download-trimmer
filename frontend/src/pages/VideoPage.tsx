import { useApplicationStore } from "../context/useApplication";
import { Navigate } from "react-router-dom";

const VideoPage = () => {
  const { uploaded } = useApplicationStore();
  if (!uploaded) {
    return <Navigate to="/" />;
  }
  return (
    <section className="h-screen pt-24">
      <div className="max-w-[25rem] shadow-lg rounded-lg bg-white py-4 px-8 space-y-4 mx-auto">
        <h1 className="text-3xl font-bold text-center">Choose options</h1>
        <CompressButton />
        <DownloadButton />
      </div>
    </section>
  );
};

const CompressButton = () => {
  return (
    <button className="bg-black text-white font-semibold px-4 py-2 w-full text-center rounded-md focus:ring-blue-300 focus:ring-2">
      Compress First
    </button>
  );
};

const DownloadButton = () => {
  return (
    <button className="bg-black text-white font-semibold px-4 py-2 w-full text-center rounded-md focus:ring-blue-300 focus:ring-2">
      Let's Trim!
    </button>
  );
};

export default VideoPage;
