import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CanvasEditor from './components/CanvasEditor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/canvas/:canvasId" element={<CanvasEditor />} />
      </Routes>
    </Router>
  );
}

export default App;