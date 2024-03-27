import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Grid from '@mui/material/Unstable_Grid2';

import {Login} from '../header/Header';
import {Decks} from '../decks/Decks';
import {ViewDeck} from '../decks/Deck';
import {Games} from '../games/Games';
import {ViewGame} from '../games/Game';
import {HomePage} from '../home-page/HomePage';

function PaddedContainer({children}: {children: React.ReactNode}): React.ReactElement {
  return <div style={{padding:"12px 0"}}>{children}</div>
}

function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/decks" element={<PaddedContainer><Decks /></PaddedContainer>} />
      <Route path="/decks/:deckId" element={<PaddedContainer><ViewDeck /></PaddedContainer>} />
      <Route path="/games" element={<PaddedContainer><Games /></PaddedContainer>} />
      <Route path="/games/:gameId" element={<ViewGame />} />
    </Routes>
  );
}

function App(): React.ReactElement {
  return (
    <Grid container direction="column" justifyContent="center" textAlign="center">
      <Login />
      <AppRoutes />
    </Grid>
  );
}

export default App;
