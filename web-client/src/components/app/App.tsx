import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';

import {Login} from '../header/Login';
import {Decks} from '../decks/Decks';
import {ViewDeck} from '../decks/Deck';
import {Games} from '../games/Games';
import {ViewGame} from '../games/Game';
import {HomePage} from '../home-page/HomePage';


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/decks" element={<Decks />} />
      <Route path="/decks/:deckId" element={<ViewDeck />} />
      <Route path="/games" element={<Games />} />
      <Route path="/games/:gameId" element={<ViewGame />} />
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
