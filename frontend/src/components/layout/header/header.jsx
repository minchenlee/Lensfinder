import './header.css';
import { Link } from 'react-router-dom';

function Header() {
  return( 
  <header className="fixed-top">
    <nav className="navbar navbar-expand-lg grey-glass">
      <Link className="brand link" to="/">LensFinder</Link>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="link" to="/analysis" >Analysis</Link>
          </li>
          <li className="nav-item">
            <Link className="link" to="/profile">Profile</Link>
          </li>
        </ul>
      </div>
    </nav>
  </header>
  )
}

export default Header