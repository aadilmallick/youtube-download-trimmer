import { useState } from "react";
import Fetcher from "../lib/Fetcher";
import { useApplicationStore } from "../context/useApplication";
import { useNavigate } from "react-router-dom";
import { Loader } from "../components/Loader";

const Home = () => {
  return (
    <section className="h-screen flex flex-col items-center">
      <div className="max-w-[40rem] shadow-lg rounded-lg bg-white py-4 px-8 mt-24">
        <h1 className="text-3xl font-bold">Video uploader</h1>
        <VideoUpload />
      </div>
    </section>
  );
};

const VideoUpload = () => {
  const [url, setUrl] = useState("");
  const { setUploaded, setFilePath } = useApplicationStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  //   const {} =
  async function uploadUrl() {
    setLoading(true);
    const data = await Fetcher.uploadUrl(url);

    // if request worked, navigate to /video
    if (data.success === true) {
      setUploaded();
      console.log("filepath:", data.filePath);
      setFilePath(data.filePath);
      setLoading(false);
      navigate("/video");
    }

    setLoading(false);
  }

  function ConditionalContent(loading: boolean) {
    if (!loading) {
      return (
        <button
          className="bg-black text-white font-semibold px-4 py-2 w-full text-center rounded-md focus:ring-blue-300 focus:ring-2"
          onClick={uploadUrl}
        >
          Trim
        </button>
      );
    } else {
      return <Loader />;
    }
  }

  return (
    <>
      <input
        type="text"
        name="url"
        id="url"
        className="p-2 border rounded-md my-4 text-sm w-full"
        placeholder="https://youtube.com/v=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      {ConditionalContent(loading)}
    </>
  );
};

export default Home;
