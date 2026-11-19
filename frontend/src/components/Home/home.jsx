import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import { assets } from '../../assets/assets';

const Home = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activePreviewCity, setActivePreviewCity] = useState('Toronto');

  const weatherPreviews = {
    Toronto: {
      temp: '4°C',
      condition: 'Crisp & Overcast',
      tag: 'Winter',
      note: 'Sub-zero structure. Anchor the silhouette with heavy wool textures, layered outerwear, and deep monochrome layering.',
    },
    Tokyo: {
      temp: '14°C',
      condition: 'Clear & Breezy',
      tag: 'Fall',
      note: 'A transitional study in weight. Balance clean lines with a heavy chore jacket or relaxed overshirt.',
    },
    Paris: {
      temp: '21°C',
      condition: 'Mild & Sunny',
      tag: 'Summer',
      note: 'Effortless breathability. Prioritize lightweight draping, open collars, and minimal hardware.',
    },
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('stylevault@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPreview = weatherPreviews[activePreviewCity];

  return (
    <div className="home-page">

      <nav className="home-nav">
        <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="brand-wordmark">Stylevault</span>
          <div className="nav-logo-wrap">
            <img src={assets.site} alt="Stylevault Logo" className="nav-logo-icon" />
          </div>
        </div>

        <div className="nav-links">
          <a href="#features">Platform</a>
          <a href="#stylebot">Style Bot</a>
          <a href="#workflow">Workflow</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-actions">
          <button className="nav-signin" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button className="nav-cta" onClick={() => navigate('/login')}>
            Open Vault
          </button>
        </div>
      </nav>


      <header className="hero-section">
        <div className="hero-container">
          <div className="hero-copy">
            <div className="hero-pill">
              <span className="pulse-dot"></span>
              <span>DIGITAL WARDROBE ARCHIVE</span>
            </div>

            <h1>Build Your Perfect Fit Collection.</h1>

            <p className="hero-subtext">
              Stylevault helps you create, save, and organize your outfits in one place.
              Track your style, store your looks, and view your wardrobe anytime.
            </p>

            <div className="hero-cta-group">
              <button className="btn-solid" onClick={() => navigate('/login')}>
                Start Your Wardrobe
                <span className="arrow">→</span>
              </button>
              <a href="#stylebot" className="btn-outline">
                Try Live Style Bot
              </a>
            </div>

            <div className="hero-metrics">
              <div className="metric">
                <strong>Masonry</strong>
                <span>Visual Archive</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric">
                <strong>Live Weather</strong>
                <span>Editorial Engine</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric">
                <strong>Community</strong>
                <span>Fit Lookbook</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="lookbook-card">
              <div className="lookbook-topbar">
                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="window-title">vault / archive_01</span>
              </div>
              <div className="lookbook-image-wrap">
                <img src={assets.opening} alt="Stylevault Wardrobe Showcase" className="hero-img" />
              </div>
              <div className="lookbook-caption-bar">
                <span className="tag-pill">Fall Rotation</span>
                <span className="caption-meta">Chore Jacket • Wide-Leg Denim</span>
              </div>
            </div>
          </div>
        </div>
      </header>

     
      <section id="features" className="bento-section">
        <div className="section-container">
          <div className="section-heading">
            <span className="eyebrow">01 / ARCHITECTURE</span>
            <h2>Built for Visual Precision</h2>
            <p>
              Every tool inside Stylevault is stripped of clutter—built to keep your focus on
              silhouettes, textures, and daily rotation.
            </p>
          </div>

          <div className="bento-grid">
    
            <div className="bento-card bento-large">
              <div className="bento-header">
                <span className="bento-index">VAULT</span>
                <span className="bento-badge">Core</span>
              </div>
              <h3>Pinterest-Style Masonry Archive</h3>
              <p>
                Upload multiple outfit photos or paste directly from your clipboard. Reorder your
                grid, attach custom category tags, and log detailed garment notes for every look.
              </p>
              <div className="bento-tags-preview">
                <span>All Photos</span>
                <span className="active-tag">Winter</span>
                <span>Fall</span>
                <span>Minimal</span>
                <span>Streetwear</span>
              </div>
            </div>

         
            <div className="bento-card">
              <div className="bento-header">
                <span className="bento-index">COMMUNITY</span>
              </div>
              <h3>Curated Fit Feed</h3>
              <p>
                Publish your daily outfits with fit breakdowns and browse clean, distraction-free
                lookbooks from other members.
              </p>
            </div>

   
            <div className="bento-card">
              <div className="bento-header">
                <span className="bento-index">FILTERING</span>
              </div>
              <h3>Instant Tag Routing</h3>
              <p>
                Filter your entire wardrobe by season, occasion, or aesthetic in one click—no
                digging through camera rolls.
              </p>
            </div>
          </div>
        </div>
      </section>

   
      <section id="stylebot" className="stylebot-showcase">
        <div className="section-container">
          <div className="stylebot-split">
            <div className="stylebot-info">
              <span className="eyebrow">02 / LIVE INTELLIGENCE</span>
              <h2>Weather-Driven Editorial Styling</h2>
              <p>
                Not sure what layers work today? Style Bot pulls live local weather conditions and
                pairs high-fashion styling direction directly with the matching category tags in
                your personal vault.
              </p>

              <div className="city-selector">
                <span className="selector-label">Test Live Forecast:</span>
                <div className="city-buttons">
                  {Object.keys(weatherPreviews).map((city) => (
                    <button
                      key={city}
                      type="button"
                      className={`city-btn ${activePreviewCity === city ? 'active' : ''}`}
                      onClick={() => setActivePreviewCity(city)}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="stylebot-demo-card">
              <div className="demo-card-top">
                <div>
                  <span className="demo-city">{activePreviewCity}</span>
                  <span className="demo-condition">{currentPreview.condition}</span>
                </div>
                <div className="demo-temp">{currentPreview.temp}</div>
              </div>

              <div className="demo-editorial-box">
                <span className="demo-label">EDITORIAL STYLING NOTE</span>
                <p>"{currentPreview.note}"</p>
              </div>

              <div className="demo-footer">
                <span>
                  Suggested Vault Tag: <strong>{currentPreview.tag}</strong>
                </span>
                <button className="demo-jump-btn" onClick={() => navigate('/login')}>
                  Filter "{currentPreview.tag}" →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

   
      <section id="workflow" className="workflow-section">
        <div className="section-container">
          <div className="section-heading">
            <span className="eyebrow">03 / WORKFLOW</span>
            <h2>Three Steps to a Dialed-In Closet</h2>
          </div>

          <div className="workflow-steps">
            <div className="step-item">
              <div className="step-num">01</div>
              <h4>Archive & Tag</h4>
              <p>
                Drop in your outfit photos, add garment descriptions, and tag them by season or
                vibe.
              </p>
            </div>

            <div className="step-item">
              <div className="step-num">02</div>
              <h4>Check the Forecast</h4>
              <p>
                Run Style Bot for your city to receive temperature-matched styling notes and vault
                filters.
              </p>
            </div>

            <div className="step-item">
              <div className="step-num">03</div>
              <h4>Publish to the Feed</h4>
              <p>
                Share your best fits with the community feed alongside your garment breakdown.
              </p>
            </div>
          </div>
        </div>
      </section>


      <footer id="contact" className="footer">
        <div className="footer-container">
          <div className="footer-cta-block">
            <span className="eyebrow dark-eyebrow">GET STARTED</span>
            <h2>Your Wardrobe, Organized.</h2>
            <p>Create your account and start building your digital lookbook in seconds.</p>
            <button className="btn-solid light-btn" onClick={() => navigate('/login')}>
              Launch Stylevault
            </button>
          </div>

          <div className="footer-bottom">
            <div className="footer-brand">
              <strong className="brand-wordmark">Stylevault</strong>
              <span>© 2026 All rights reserved.</span>
            </div>

            <div className="email-wrap" onClick={copyEmail} title="Click to copy email">
              <span className="email-label">Inquiries & Support</span>
              <p className="footer-email">stylevault@gmail.com</p>
              <span className={`copied-msg ${copied ? 'show' : ''}`}>
                {copied ? 'Copied to clipboard' : 'Click to copy'}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;