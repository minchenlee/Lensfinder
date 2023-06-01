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
    <nav className="navbar grey-glass">
      <div className='nav-link-list'>
        <Link className="brand link me-2" to="/">LensFinder</Link>
        <Link className="link ms-5 desktop-nav" to="/analysis">Analysis</Link>
        <Link className="link ms-5 desktop-nav" to="/profile" >Profile</Link>
        {isSignedIn ?
          <button className="sign-in-up ms-auto me-4 desktop-nav" type="button" onClick={handleSignOut}>
            Sign Out
          </button>
          :
          <button className="sign-in-up ms-auto me-4 desktop-nav" type="button" data-bs-toggle="modal" data-bs-target="#signInUpModal">
            Sign In/Up
          </button> 
        }
        <button className="menu-button ms-auto" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
            <i className="bi bi-list"></i>
        </button>
      </div>
    </nav>
    <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasRight"  
    aria-labelledby="offcanvasRightLabel">
      <div className="offcanvas-header">
        <button type="button" className="ms-auto menu-close" data-bs-dismiss="offcanvas" aria-label="Close">
          <i className="bi bi-x"></i>
        </button>
      </div>
      <div className="offcanvas-body">
        <div className="nav-link-list flex-column">
          <Link className="link my-3" to="/">Home</Link>
          <Link className="link my-3" to="/analysis">Analysis</Link>
          <Link className="link my-3" to="/profile">Profile</Link>
          {isSignedIn ?
            <button className="sign-in-up my-3" type="button" onClick={handleSignOut} data-bs-dismiss="offcanvas">
              Sign Out
            </button>
            :
            <button className="sign-in-up my-3" type="button" data-bs-toggle="modal" data-bs-target="#signInUpModal">
              Sign In/Up
            </button>
          }
        </div>
      </div>
    </div>
  </header>
  )
}

export default Header