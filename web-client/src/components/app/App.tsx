import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';

import {Login} from '../header/Login';
import {Decks} from '../decks/Decks';
import {HomePage} from '../home-page/HomePage';


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/decks" element={<Decks />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <Login />
      <AppRoutes />
    </div>
  );
}

export default App;
