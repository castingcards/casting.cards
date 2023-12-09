import { Link } from 'react-router-dom';
import './HomePage.css';


export function HomePage() {
  return <header className="App-header">
      <img src="/magic-table-logo.webp" className="App-logo" alt="logo" />
      <p>
        <Link to="/decks">
          See your decks!
        </Link>
      </p>
    </header>;
}