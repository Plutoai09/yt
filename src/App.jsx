import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AudioPlayer from "./components/AudioPlayer";
import Home from "./components/Home";
import UpdateForm from "./components/UpdateForm";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/update" element={<UpdateForm />} />
        <Route path="/login/:name/:bookName/:Name" element={<Login />} />
        <Route path="/:name/:bookName/:Name" element={<AudioPlayer />} />
      </Routes>
    </Router>
  );
}

export default App;
