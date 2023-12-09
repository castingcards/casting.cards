import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import './App.css';

import {Login} from './Login';
import {Decks} from './Decks';
import {HomePage} from './HomePage';


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
