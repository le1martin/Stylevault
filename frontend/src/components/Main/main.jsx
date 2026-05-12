import React, { useState } from 'react'
import './main.css'
import { assets } from '../../assets/assets'

const Main = () => {
  const [activeTab, setActiveTab] = useState('vault');

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="main-page">

      <aside className="sidebar">

        <div className="logo-section">
          <img src={assets.site} alt="logo" className="logo-img" />
        </div>

        <nav className="main-menu">
          <ul className="nav-list">

            <li>
              <a
                href="#vault"
                className={activeTab === 'vault' ? 'active' : ''}
                onClick={() => handleTabClick('vault')}
                data-tooltip="Your Vault"
              >
                <img src={assets.vault} alt="vault" className="nav-icon" />
              </a>
            </li>

            <li>
              <a
                href="#community"
                className={activeTab === 'community' ? 'active' : ''}
                onClick={() => handleTabClick('community')}
                data-tooltip="Community"
              >
                <img src={assets.community} alt="community" className="nav-icon" />
              </a>
            </li>

            <li>
              <a
                href="#recommendations"
                className={activeTab === 'recommendations' ? 'active' : ''}
                onClick={() => handleTabClick('recommendations')}
                data-tooltip="Style Bot"
              >
                <img src={assets.recommendation} alt="recommendations" className="nav-icon" />
              </a>
            </li>

          </ul>
        </nav>

        <div className="sidebar-footer">
          <a
            href="#settings"
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => handleTabClick('settings')}
            data-tooltip="Settings"
          >
            <img
              src={assets.settings}
              alt="settings"
              className="nav-icon"
            />
          </a>
        </div>

      </aside>

      <main className="content">
        {activeTab === 'vault' && <div>Your Vault</div>}
        {activeTab === 'community' && <div>Community Feed</div>}
        {activeTab === 'recommendations' && <div>Style Bot</div>}
        {activeTab === 'settings' && <div>Settings Page</div>}
      </main>

    </div>
  )
}

export default Main