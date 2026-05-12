import React from 'react'
import { useNavigate } from 'react-router-dom'
import './home.css'
import { assets } from '../../assets/assets'

const Home = () => {
  const navigate = useNavigate();

  const copyEmail = () => {
    navigator.clipboard.writeText("stylevault@gmail.com");
    alert("Email copied to clipboard!"); 
  };
  

  return (
    <>
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
          <img src={assets.opening} className="opening-img" alt="Stylevault Visual" />
        </div>
      </div>

      <div id="about" className="about-home">
        <h2>Stylevault</h2>
        <p>
          Stylevault is your personal digital wardrobe designed to simplify how you dress.
          Instead of guessing what to wear, you can organize your clothing, create outfits,
          and keep track of your style all in one place.
        </p>
  

        <div className="about-cards">
          <div className="about-card">
            <h3>Organize</h3>
            <p>Keep all your clothing items stored and easy to access.</p>
          </div>

          <div className="about-card">
            <h3>Create</h3>
            <p>Build outfits for any occasion with ease.</p>
          </div>

          <div className="about-card">
            <h3>Track</h3>
            <p>Understand your style and what you wear most.</p>
          </div>
        </div>
      </div>

      <div id="features" className="features-home">
        <h2>Features </h2>

        <div className="features-cards">
          <div className="feature-card">
            <h3>📦 Wardrobe Library</h3>
            <p>Upload and store every clothing item with images and categories.</p>
          </div>

          <div className="feature-card">
            <h3>📊 Wear Insights</h3>
            <p>Track what you wear most and discover your real style habits.</p>
          </div>
          <div className="feature-card">
            <h3>🤖 AI Style Assistant</h3>
            <p>
              Discover new looks and get outfit suggestions based on the weather and your wardrobe.
            </p>
          </div>
        </div>
      </div>

      <footer id="contact" className="footer">
        <div className="footer-content">
          <p>© 2026 Stylevault. All rights reserved.</p>
          <p onClick={copyEmail} className="footer-email">
            stylevault@gmail.com
          </p>
          
        </div>
      </footer>
    </>
  )
}

export default Home;