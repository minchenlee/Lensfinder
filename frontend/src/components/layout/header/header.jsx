import './header.css';
import { Link } from 'react-router-dom';
import { useState, useEffect, useContext} from 'react';
import { AllPageContext } from '../../../App.jsx';


function Header() {  
  // 判斷是否登入
  const {isSignedIn, setIsSignedIn} = useContext(AllPageContext);

  // 登出
  function handleSignOut() {
    localStorage.removeItem('lensFinderToken');
    setIsSignedIn(false);
  }

  return( 
  <header className="fixed-top">
    <nav className="navbar navbar-expand-lg grey-glass">
      <Link className="brand link" to="/">LensFinder</Link>
      <button className="navbar-toggler" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="link" to="/analysis">Analysis</Link>
          </li>
          <li className="nav-item">
            <Link className="link" to="/profile" >Profile</Link>
          </li>
        </ul>
        {isSignedIn ?
          <button className="sign-in-up" type="button" onClick={handleSignOut}>
            Sign Out
          </button>
          :
          <button className="sign-in-up" type="button" data-bs-toggle="modal" data-bs-target="#signInUpModal">
            Sign In/Up
          </button> 
        }
       
      </div>
    </nav>
  </header>
  )
}

export default Header