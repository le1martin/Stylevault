import React, { useState } from 'react';
import './Login.css';
import { assets } from '../../assets/assets'; 
import { auth, googleProvider, facebookProvider } from '../../firebase';
import { useNavigate } from 'react-router-dom'; 
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

const API_BASE_URL = 'http://localhost:5000';

const Login = () => { 
  const [currState, setCurrState] = useState("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "" });

  const navigate = useNavigate(); 

  const triggerPopup = (msg) => {
    setPopup({ show: true, message: msg });
    setTimeout(() => setPopup({ show: false, message: "" }), 3000);
  };

  // Helper function to sync sign-up display name with Flask backend
  const syncProfileToBackend = async (userId, displayName) => {
    try {
      const formData = new FormData();
      formData.append('display_name', displayName);

      await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'X-User-ID': userId },
        body: formData,
      });
    } catch (err) {
      console.error("Failed to sync profile to backend:", err);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault(); 
    try {
      if (currState === "Sign Up") {
        // 1. Create account in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Attach display name to Firebase Auth profile & sync to Flask
        if (name.trim()) {
          await updateProfile(user, { displayName: name.trim() });
          await syncProfileToBackend(user.uid, name.trim());
        }

        triggerPopup("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        triggerPopup("Welcome back!");
      }
      
      setTimeout(() => navigate('/main'), 1500); 

    } catch (error) {
      console.error("Auth Error Code:", error.code);
      if (error.code === 'auth/wrong-password') {
        triggerPopup("Check the password"); 
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        triggerPopup("Account not found. Please sign up.");
      } else {
        triggerPopup(error.message);
      }
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const res = await signInWithPopup(auth, facebookProvider);
      if (res.user?.displayName) {
        await syncProfileToBackend(res.user.uid, res.user.displayName);
      }
      triggerPopup("Logged in with Facebook");
      setTimeout(() => navigate('/main'), 1500);
    } catch (error) { console.error(error); }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user?.displayName) {
        await syncProfileToBackend(res.user.uid, res.user.displayName);
      }
      triggerPopup("Logged in with Google");
      setTimeout(() => navigate('/main'), 1500);
    } catch (error) { console.error(error); }
  };

  return (
    <div className="login-page">
      {popup.show && (
        <div className="custom-popup">
          <p>{popup.message}</p>
        </div>
      )}

      <form className="login-container" onSubmit={handleEmailAuth}>
        <div className="login-logo">
           <img src={assets.logo} alt="Stylevault Logo" />
        </div>

        <div className="login-title">
          <h2>{currState}</h2>
        </div>
        
        <div className="login-inputs">
          {currState === "Sign Up" && (
            <input 
              type="text" 
              placeholder="Your name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          )}
          <input 
            type="email" 
            placeholder="Your email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" className="btn">
          {currState === "Sign Up" ? "Create account" : "Login"}
        </button>

        <div className="social-login-separator">
          <hr /> <span>or</span> <hr />
        </div>

        <div className="social-login-options">
          <button type="button" className="social-btn" onClick={handleGoogleLogin}>
            <img src={assets.google} alt="Google" />
          </button>
          <button type="button" className="social-btn" onClick={handleFacebookLogin}>
            <img src={assets.facebook} alt="Facebook" />
          </button>
        </div>
      
        {currState === "Login" 
          ? <p>New to Stylevault? <span onClick={() => setCurrState("Sign Up")}>Create account</span></p>
          : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
        }
      </form>
    </div>
  );
};

export default Login;