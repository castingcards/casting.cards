import { Link } from 'react-router-dom';

import Button from '@mui/material/Button';

import './HomePage.css';


export function HomePage() {
  return <header className="App-header">
      <img src="/magic-table-logo.webp" className="App-logo" alt="logo" />
      <p>
        <Button component={Link} to="/decks">
          See your decks!
        </Button>
        <Button component={Link} to="/games">
          Create or Join a game!
        </Button>
      </p>
    </header>;
}