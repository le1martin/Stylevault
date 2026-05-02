import React from 'react'
import './navbar.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom' 

const Navbar = () => {
  return (
    <div className="navbar">
      <Link to='/'><img src={assets.logo} className="logo" /></Link>
      
      <ul className="navbar-menu">
        <li>the method</li>
        <li>features</li>
        <li>community</li>
      </ul>

      <div className="navbar-button">
        <Link to='/login'>
          <button>join now</button>
        </Link>
      </div>
    </div>
  )
}

export default Navbar