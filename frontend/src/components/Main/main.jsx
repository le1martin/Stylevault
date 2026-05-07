import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import './main.css';

const Main = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); 
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        <p>Loading your vault...</p>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="main-content">
        <header className="main-header">
          <h1>Your Stylevault</h1>
          <p>Welcome back, {user.email}</p>
        </header>

        <section className="vault-dashboard">
          <div className="vault-stats">
            <div className="stat-card">
              <h3>Total Outfits</h3>
              <p>0</p>
            </div>
            <div className="stat-card">
              <h3>Recently Added</h3>
              <p>None yet</p>
            </div>
          </div>

          <div className="main-actions">
            <button className="btn primary">Add New Fit</button>
            <button className="btn secondary" onClick={handleLogout}>Logout</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Main;