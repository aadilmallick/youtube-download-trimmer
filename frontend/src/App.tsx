import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VideoPage from "./pages/VideoPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="*" element={<h1>Not found. Page doesn't exist</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
