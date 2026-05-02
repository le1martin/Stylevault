import React from 'react'
import { useNavigate } from 'react-router-dom'
import './home.css'
import { assets } from '../../assets/assets'

const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="header">


      <div className="header-contents">
        <h2>Build Your Perfect Fit Collection.</h2>
        <p>
          Stylevault helps you create, save, and organize your outfits in one place.
          Track your style, store your looks, and view your wardrobe anytime.
        </p>
        <div className="header-btn">
          <button className="btn" onClick={() => navigate('/login')}>
            Start Your Wardrobe
          </button>
        </div>
      </div>


      <div className="header-visual">
        <img src={assets.opening} className="opening-img"  />
      </div>
    </div>
  )
}

export default Header
