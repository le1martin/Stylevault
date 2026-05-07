import React from 'react'
import './navbar.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className="navbar">

      <Link to='/'>
        <img src={assets.logo} className="logo" />
      </Link>

      <ul className="navbar-menu">
        <li><a href="#about">about</a></li>
        <li><a href="#features">features</a></li>
        <li><a href="#contact">contact</a></li>
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