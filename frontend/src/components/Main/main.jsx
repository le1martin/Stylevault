import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './main.css';
import { assets } from '../../assets/assets';
import { auth } from '../../firebase';
import { onAuthStateChanged, updateProfile, signOut } from 'firebase/auth';

const API_BASE_URL = 'http://localhost:5000';
const MAX_TAG_LENGTH = 24;
const POPOVER_WIDTH = 240;
const POPOVER_GAP = 6;
const VIEWPORT_MARGIN = 12;

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

const TagPicker = ({ tags, allTags, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const popHeight = popoverRef.current?.offsetHeight || 0;

    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN)
    );

    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
    const openUp = popHeight > spaceBelow && rect.top > spaceBelow;
    const top = openUp
      ? Math.max(VIEWPORT_MARGIN, rect.top - popHeight - POPOVER_GAP)
      : rect.bottom + POPOVER_GAP;

    setPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, allTags.length, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e) => {
      if (triggerRef.current?.contains(e.target) || popoverRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onScroll = (e) => {
      if (popoverRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onResize = () => setOpen(false);

    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const toggleTag = (name) => {
    onChange(tags.includes(name) ? tags.filter((t) => t !== name) : [...tags, name]);
  };

  const addCategory = () => {
    const cleaned = text.trim().slice(0, MAX_TAG_LENGTH);
    if (!cleaned) return;

    const existing = allTags.find((t) => t.toLowerCase() === cleaned.toLowerCase());
    const name = existing || cleaned;

    if (!tags.includes(name)) onChange([...tags, name]);
    setText('');
  };

  return (
    <div className="tag-picker">
      <button
        type="button"
        ref={triggerRef}
        className="tag-trigger"
        title="Categories"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="tag-trigger-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="tag-popover"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="tag-custom-row">
              <input
                type="text"
                className="tag-custom-input"
                placeholder="New category..."
                maxLength={MAX_TAG_LENGTH}
                value={text}
                autoFocus
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCategory();
                  }
                }}
              />
              <button type="button" className="tag-custom-add" onClick={addCategory}>
                Add
              </button>
            </div>

            {allTags.length > 0 ? (
              <div className="tag-group">
                <div className="tag-group-label">Your categories</div>
                <div className="tag-group-options">
                  {allTags.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`tag-chip-option ${tags.includes(name) ? 'active' : ''}`}
                      onClick={() => toggleTag(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="tag-empty-hint">Type a name and press Enter to create a category.</p>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

const Main = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vault');
  const [images, setImages] = useState([]);
  const [tagFilter, setTagFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);

  const [displayName, setDisplayName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const avatarInputRef = useRef(null);

  const [communityPosts, setCommunityPosts] = useState([]);
  const [newCaption, setNewCaption] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [postPreview, setPostPreview] = useState('');
  const [uploadingPost, setUploadingPost] = useState(false);
  const communityInputRef = useRef(null);

  // Stylebot State
  const [botCity, setBotCity] = useState('Toronto');
  const [weatherData, setWeatherData] = useState(null);
  const [botLoading, setBotLoading] = useState(false);

  const allTags = [...new Set(images.flatMap((img) => img.tags || []))].sort((a, b) =>
    a.localeCompare(b)
  );

  useEffect(() => {
    if (tagFilter !== 'all' && !allTags.includes(tagFilter)) setTagFilter('all');
  }, [allTags, tagFilter]);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setCurrentUser(user));
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    setDisplayName(currentUser.displayName || '');
    setAvatarPreview(currentUser.photoURL || '');

    const fetchUserProfile = async () => {
      try {
        const profile = await apiFetch('/api/profile');
        if (profile.display_name) setDisplayName(profile.display_name);
        if (profile.avatar_url) setAvatarPreview(`${API_BASE_URL}${profile.avatar_url}`);
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };

    if (activeTab === 'settings') {
      fetchUserProfile();
    }
  }, [activeTab, currentUser]);

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
    if ((activeTab === 'vault' || activeTab === 'recommendations') && currentUser) fetchVaultItems();
  }, [activeTab, currentUser, fetchVaultItems]);

  const uploadImagesToBackend = async (fileArray) => {
    if (!fileArray?.length) return;

    const tempItems = fileArray.map((file, i) => ({
      id: `temp-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      description: "Saving...",
      tags: [],
      isTemporary: true,
    }));

    setImages((prev) => [...tempItems, ...prev]);

    const formData = new FormData();
    fileArray.forEach((file) => formData.append('images', file));

    try {
      const userId = getCurrentUserId();
      const res = await fetch(`${API_BASE_URL}/api/vault/upload`, {
        method: 'POST',
        headers: { 'X-User-ID': userId },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

      await fetchVaultItems();
    } catch (error) {
      console.error("Upload error:", error);
      setImages((prev) => prev.filter((img) => !img.isTemporary));
      alert("Upload failed. Check your Flask terminal for server errors.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, description: value } : img))
    );

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

  const handleTagsChange = async (id, tags) => {
    if (String(id).startsWith('temp-')) return;

    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, tags } : img)));

    try {
      await apiFetch(`/api/vault/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });
    } catch (error) {
      console.error("Failed to update categories:", error);
      fetchVaultItems();
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

  const fetchCommunityFeed = useCallback(async () => {
    try {
      const data = await apiFetch('/api/community/feed');
      setCommunityPosts(data);
    } catch (err) {
      console.error("Error loading community feed:", err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'community' && currentUser) {
      fetchCommunityFeed();
    }
  }, [activeTab, currentUser, fetchCommunityFeed]);

  const handleCommunityImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostFile(file);
      setPostPreview(URL.createObjectURL(file));
    }
  };

  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!postFile) return;

    setUploadingPost(true);
    try {
      const formData = new FormData();
      formData.append('image', postFile);
      formData.append('caption', newCaption);

      await apiFetch('/api/community/post', {
        method: 'POST',
        body: formData,
      });

      setPostFile(null);
      setPostPreview('');
      setNewCaption('');
      if (communityInputRef.current) communityInputRef.current.value = '';
      await fetchCommunityFeed();
    } catch (err) {
      console.error("Failed to publish post:", err);
    } finally {
      setUploadingPost(false);
    }
  };

  const handleDeleteCommunityPost = async (postId) => {
    try {
      await apiFetch(`/api/community/post/${postId}`, { method: 'DELETE' });
      setCommunityPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Failed to delete community post:", error);
    }
  };

  const fetchWeatherAdvice = async () => {
    setBotLoading(true);
    try {
      const res = await apiFetch(`/api/weather-advice?city=${encodeURIComponent(botCity)}`);
      setWeatherData(res);
    } catch (err) {
      console.error("Failed to fetch weather advice", err);
      setWeatherData({
        city: botCity,
        temperature: 12,
        condition: "crisp air",
        advice: "Great weather for a layered chore jacket or sweater.",
        editorialNote: "A transitional study in weight. Balance clean lines with a heavy chore jacket or relaxed overshirt.",
        suggestedTag: "Fall"
      });
    } finally {
      setBotLoading(false);
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');

    try {
      const formData = new FormData();
      formData.append('display_name', displayName);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const updatedProfile = await apiFetch('/api/profile', {
        method: 'PUT',
        body: formData,
      });

      if (auth.currentUser) {
        const photoURL = updatedProfile.avatar_url
          ? `${API_BASE_URL}${updatedProfile.avatar_url}`
          : auth.currentUser.photoURL;

        await updateProfile(auth.currentUser, {
          displayName: displayName,
          photoURL: photoURL,
        });
      }

      setProfileMessage('Profile updated successfully!');
    } catch (err) {
      console.error("Failed to save profile:", err);
      setProfileMessage('Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  const navTabs = [
    { id: 'vault', label: 'Your Vault' },
    { id: 'community', label: 'Community Feed' },
    { id: 'recommendations', label: 'Style Bot' },
  ];

  return (
    <div className="main-page">
      <aside className="sidebar">
        <div className="logo-section">
          <img src={assets.site} alt="logo" className="logo-img" />
        </div>
        <nav className="main-menu">
          <ul className="nav-list">
            {navTabs.map((tab) => (
              <li key={tab.id}>
                <a
                  href={`#${tab.id}`}
                  data-tooltip={tab.label}
                  className={activeTab === tab.id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(tab.id);
                  }}
                >
                  <img src={assets[tab.id] || assets.recommendation} alt={tab.label} className="nav-icon" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <a
            href="#settings"
            data-tooltip="Settings"
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('settings');
            }}
          >
            <img src={assets.settings} alt="settings" className="nav-icon" />
          </a>
        </div>
      </aside>

      <main className="content">
        {activeTab === 'vault' && (
          <div className="vault-container">
            <header className="vault-header vault-header-stacked">
              <div className="header-title-group">
                <h2>Your Vault</h2>
              </div>
              <div className="vault-controls-row">
                <select
                  className="tag-filter-select"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                >
                  <option value="all">All photos</option>
                  {allTags.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="upload-btn"
                  onClick={() => fileInputRef.current.click()}
                >
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
              </div>
            </header>
            <div className="pinterest-grid">
              {images.map((item, index) => {
                const itemTags = item.tags || [];
                if (tagFilter !== 'all' && !itemTags.includes(tagFilter)) return null;

                return (
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
                      <div className="description-row">
                        <TagPicker
                          tags={itemTags}
                          allTags={allTags}
                          disabled={item.isTemporary}
                          onChange={(tags) => handleTagsChange(item.id, tags)}
                        />
                        <textarea
                          className="description-input"
                          placeholder="Describe your outfit..."
                          rows="1"
                          disabled={item.isTemporary}
                          value={item.description || ''}
                          onChange={(e) => handleDescriptionChange(item.id, index, e.target.value)}
                        />
                      </div>

                      {itemTags.length > 0 && (
                        <div className="tag-chip-list">
                          {itemTags.map((name) => (
                            <span key={name} className="tag-chip">
                              {name}
                              <button
                                type="button"
                                className="tag-chip-remove"
                                title={`Remove ${name}`}
                                onClick={() =>
                                  handleTagsChange(item.id, itemTags.filter((t) => t !== name))
                                }
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="community-container">
            <header className="vault-header">
              <div className="header-title-group">
                <h2>Community Feed</h2>
              </div>
            </header>

            <form onSubmit={handlePublishPost} className="community-publish-box">
              <div className="publish-input-row">
                <div className="publish-left-col">
                  <div
                    className="publish-preview-box"
                    onClick={() => communityInputRef.current?.click()}
                  >
                    {postPreview ? (
                      <img src={postPreview} alt="Upload preview" />
                    ) : (
                      <span>+ Add Fit Photo</span>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  ref={communityInputRef}
                  accept="image/*"
                  onChange={handleCommunityImageSelect}
                  style={{ display: 'none' }}
                />
                
                <textarea
                  className="community-caption-input"
                  placeholder="Share details about your fit..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  rows="3"
                />
              </div>

              {postFile && (
                <div className="publish-footer-row">
                  <button type="submit" className="upload-btn" disabled={uploadingPost}>
                    {uploadingPost ? 'Posting...' : 'Share to Community'}
                  </button>
                </div>
              )}
            </form>

            <div className="pinterest-grid community-grid">
              {communityPosts.map((post) => (
                <div key={post.id} className="grid-item community-card">
                  {post.user_id === getCurrentUserId() && (
                    <div className="action-overlay">
                      <button
                        className="action-btn remove-btn"
                        title="Delete post"
                        onClick={() => handleDeleteCommunityPost(post.id)}
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  <div className="community-photo-wrapper">
                    <img src={`${API_BASE_URL}${post.url}`} alt="Community outfit" />
                  </div>

                  <div className="community-user-bar">
                    <div className="community-avatar">
                      {post.avatar_url ? (
                        <img src={`${API_BASE_URL}${post.avatar_url}`} alt={post.display_name} />
                      ) : (
                        <span>{post.display_name ? post.display_name.charAt(0).toUpperCase() : 'U'}</span>
                      )}
                    </div>
                    <div className="community-name-tag">
                      <span className="community-username">{post.display_name || 'Anonymous'}</span>
                    </div>
                  </div>

                  {post.caption && (
                    <div className="image-details">
                      <p className="community-caption">{post.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations-container" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <header className="vault-header">
              <div className="header-title-group">
                <h2>Style Bot</h2>
              </div>
            </header>

            <div className="stylebot-card">
              <h3>Weather-Based Recommendations</h3>
              <p className="stylebot-subtitle">Enter your city to get real-time outfit advice and editorial styling notes from your vault.</p>
              
              <div className="stylebot-input-row" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <input 
                  type="text" 
                  value={botCity} 
                  onChange={(e) => setBotCity(e.target.value)} 
                  placeholder="Enter city..."
                  className="stylebot-city-input"
                />
                <button onClick={fetchWeatherAdvice} className="upload-btn" disabled={botLoading}>
                  {botLoading ? 'Checking...' : 'Ask Stylebot'}
                </button>
              </div>

              {weatherData && (
                <div className="stylebot-result">
                  <p><strong>{weatherData.city}:</strong> {weatherData.temperature}°C, {weatherData.condition}</p>
                  <p className="stylebot-advice">"{weatherData.advice}"</p>
                  
                  {weatherData.editorialNote && (
                    <div className="stylebot-editorial-box">
                      <span className="editorial-label">Editorial Styling Note</span>
                      <p className="editorial-text">{weatherData.editorialNote}</p>
                    </div>
                  )}

                  {weatherData.suggestedTag && (
                    <div style={{ marginTop: '16px' }}>
                      <span className="stylebot-tag-hint">Suggested category: <strong>{weatherData.suggestedTag}</strong></span>
                      <button 
                        onClick={() => {
                          setTagFilter(weatherData.suggestedTag);
                          setActiveTab('vault');
                        }}
                        className="upload-btn"
                        style={{ marginTop: '10px', width: '100%' }}
                      >
                        View Vault Outfits for "{weatherData.suggestedTag}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-container">
            <div className="header-title-group settings-header">
              <h2>Settings</h2>
            </div>
            <form onSubmit={handleSaveProfile} className="settings-form">
              <div className="avatar-picker-section">
                <div
                  className="avatar-circle"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="avatar-img" />
                  ) : (
                    <div className="avatar-placeholder">
                      {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="avatar-hover-label">Change</span>
                </div>
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="save-btn" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>

              {profileMessage && <p className="profile-status-message">{profileMessage}</p>}
            </form>

            <hr className="settings-divider" style={{ margin: '2rem 0', borderColor: '#333' }} />

            <button type="button" className="logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Main;