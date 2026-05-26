import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import JoinView from './views/JoinView';
import LobbyView from './views/LobbyView';
import DashboardView from './views/DashboardView';
import GameView from './views/GameView';
import PodiumView from './views/PodiumView';

function HomeDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans p-4">
      <h1 className="text-5xl text-blue-400 font-bold mb-10 tracking-wider shadow-sm">MATHFAST RACING</h1>
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <Link to="/login" className="bg-blue-600 text-center py-4 rounded-lg hover:bg-blue-500 transition-colors shadow-lg font-semibold text-lg">Teacher Login</Link>
        <Link to="/register" className="bg-green-600 text-center py-4 rounded-lg hover:bg-green-500 transition-colors shadow-lg font-semibold text-lg">Guest Register</Link>
        <Link to="/lobby" className="bg-purple-600 text-center py-4 rounded-lg hover:bg-purple-500 transition-colors shadow-lg font-semibold text-lg">Race Lobby</Link>
        <Link to="/admin" className="bg-red-600 text-center py-4 rounded-lg hover:bg-red-500 transition-colors shadow-lg font-semibold text-lg">Dashboard Controls</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/join" element={<JoinView />} />
        <Route path="/lobby" element={<LobbyView />} />
        <Route path="/admin" element={<DashboardView />} />
        <Route path="/game" element={<GameView />} />
        <Route path="/podium" element={<PodiumView />} />
      </Routes>
    </BrowserRouter>
  );
}
