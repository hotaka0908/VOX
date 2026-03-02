import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Camera from "@/pages/Camera";
import Guide from "@/pages/Guide";
import Memories from "@/pages/Memories";

function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-vox-bg text-white">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Camera />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/memories" element={<Memories />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
