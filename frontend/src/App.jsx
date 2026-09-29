import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/"
          element={
            <div>
              <h2>Welcome to SkillSwap</h2>
              <p>Learn skills. Teach skills. Exchange knowledge.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;