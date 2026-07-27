import React, { useState, useRef, useEffect, useCallback } from 'react';
import './main.css';
import { assets } from '../../assets/assets';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const API_BASE_URL = 'http://localhost:5000';

const getCurrentUserId = () => {
  return auth.currentUser?.uid || JSON.parse(localStorage.getItem('user') || '{}').uid || null;
};

const apiFetch = async (endpoint, options = {}) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...options.headers, 'X-User-ID': userId },
  });

  if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
  return res.json();
};

const Main = () => {
  const [activeTab, setActiveTab] = useState('vault');
  const [images, setImages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);


  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setCurrentUser(user));
  }, []);


  const fetchVaultItems = useCallback(async () => {
    if (!getCurrentUserId()) return setImages([]);
    try {
      const data = await apiFetch('/api/vault');
      setImages(data);
    } catch (err) {
      console.error("Error fetching vault:", err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'vault' && currentUser) fetchVaultItems();
  }, [activeTab, currentUser, fetchVaultItems]);


  const uploadImagesToBackend = async (fileArray) => {
    if (!fileArray?.length) return;

    const tempItems = fileArray.map((file, i) => ({
      id: `temp-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      description: "Saving...",
      isTemporary: true,
    }));

    setImages((prev) => [...tempItems, ...prev]);

    const formData = new FormData();
    fileArray.forEach((file) => formData.append('images', file));

    try {
      await apiFetch('/api/vault/upload', { method: 'POST', body: formData });
      await fetchVaultItems();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      await fetchVaultItems();
    }
  };


  const handleRemoveImage = async (id, indexToRemove) => {
    if (String(id).startsWith('temp-')) return;
    try {
      await apiFetch(`/api/vault/${id}`, { method: 'DELETE' });
      setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleDescriptionChange = async (id, index, value) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index].description = value;
      return updated;
    });

    if (String(id).startsWith('temp-')) return;
    try {
      await apiFetch(`/api/vault/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: value }),
      });
    } catch (error) {
      console.error("Failed to update description:", error);
    }
  };

  const handleMoveImage = async (index, direction) => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setImages(updated);

    try {
      await apiFetch('/api/vault/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated.map((img) => img.id) }),
      });
    } catch (error) {
      console.error("Reorder failed:", error);
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      if (activeTab !== 'vault') return;
      const items = Array.from(e.clipboardData?.items || []);
      const pastedFiles = items
        .filter((item) => item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter(Boolean);

      if (pastedFiles.length > 0) {
        e.preventDefault();
        uploadImagesToBackend(pastedFiles);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [activeTab, currentUser]);

  return (
    <div className="main-page">
      <aside className="sidebar">
        <div className="logo-section">
          <img src={assets.site} alt="logo" className="logo-img" />
        </div>
        <nav className="main-menu">
          <ul className="nav-list">
            {['vault', 'community', 'recommendations'].map((tab) => (
              <li key={tab}>
                <a
                  href={`#${tab}`}
                  className={activeTab === tab ? 'active' : ''}
                  onClick={() => setActiveTab(tab)}
                >
                  <img src={assets[tab] || assets.recommendation} alt={tab} className="nav-icon" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <a
            href="#settings"
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <img src={assets.settings} alt="settings" className="nav-icon" />
          </a>
        </div>
      </aside>

      <main className="content">
        {activeTab === 'vault' && (
          <div className="vault-container">
            <header className="vault-header">
              <h2>Your Vault</h2>
              <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
                Upload Photos
              </button>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={(e) => uploadImagesToBackend(Array.from(e.target.files || []))}
                style={{ display: 'none' }}
              />
            </header>

            <div className="pinterest-grid">
              {images.map((item, index) => (
                <div key={item.id} className={`grid-item ${item.isTemporary ? 'item-syncing' : ''}`}>
                  <div className="action-overlay">
                    {index > 0 && !item.isTemporary && (
                      <button className="action-btn reorder-btn" onClick={() => handleMoveImage(index, 'left')}>
                        &#8592;
                      </button>
                    )}
                    {index < images.length - 1 && !item.isTemporary && (
                      <button className="action-btn reorder-btn" onClick={() => handleMoveImage(index, 'right')}>
                        &#8594;
                      </button>
                    )}
                    {!item.isTemporary && (
                      <button className="action-btn remove-btn" onClick={() => handleRemoveImage(item.id, index)}>
                        &times;
                      </button>
                    )}
                  </div>

                  <img
                    src={item.isTemporary ? item.url : `${API_BASE_URL}${item.url}`}
                    alt={`Vault item ${index + 1}`}
                  />

                  <div className="image-details">
                    <textarea
                      className="description-input"
                      placeholder="Describe your outfit..."
                      rows="2"
                      disabled={item.isTemporary}
                      value={item.description || ''}
                      onChange={(e) => handleDescriptionChange(item.id, index, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'community' && <div>Community Feed</div>}
        {activeTab === 'recommendations' && <div>Style Bot</div>}
        {activeTab === 'settings' && <div>Settings Page</div>}
      </main>
    </div>
  );
};

export default Main;