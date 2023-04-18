import React from 'react';
import './App.css';

import LoginPage from './components/LoginPage';
import AudioManager from './components/AudioManager';
import SignupPage from './components/SignupPage';
import ManageAccountPage from "./components/ManageAccountPage";
import { BrowserRouter,Routes, Route} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path='/manageaccount' element={<ManageAccountPage />} />
          <Route path="/" element={<AudioManager />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
