import React from 'react'
import './navbar.css'
import { assets } from '../../assets/assets'

const Navbar = () => {
  return (
    <div className="navbar">

      <img src={assets.logo} alt="Logo" className="logo" />

      <ul className="navbar-menu">
        <li>the method</li>
        <li>features</li>
        <li>community </li>
      </ul>


      <div className="navbar-button">
        <button>join now</button>
      </div>

    </div>


  )
}

export default Navbar