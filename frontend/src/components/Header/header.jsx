import React from 'react'
import './header.css'
import { assets } from '../../assets/assets'

const Header = () => {
  return (
    <div className="header">
      <div className="header-contents">
        <h2>Become The Ideal Version Of You.</h2>
        <p>
          Habify is a simple tool designed to help you build better habits,
          stay consistent, and improve little by little every day.
        </p>
        <div className="header-cta">
          <button className="btn">Start Tracking Today</button>
        </div>
      </div>


      <div className="header-visual">
        <img src={assets.opening} alt="opening" className="opening-img" />
      </div>
    </div>
  )
}

export default Header
