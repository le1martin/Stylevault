import React, { useState } from 'react';
import './Login.css';
import { assets } from '../../assets/assets'; 
import { auth, googleProvider, facebookProvider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => { 
  const [currState, setCurrState] = useState("Login");

  const handleFacebookLogin = async () => {
      const result = await signInWithPopup(auth, facebookProvider);
  }

  const handleGoogleLogin = async () => {
      const result = await signInWithPopup(auth, googleProvider);
  }

  
  return (
    <div className="login-page">
      <form className="login-container" onSubmit={(e) => e.preventDefault()}>
        
        <div className="login-logo">
           <img src={assets.logo} alt="Stylevault Logo" />
        </div>

        <div className="login-title">
          <h2>{currState}</h2>
        </div>
        
        <div className="login-inputs">
          {currState === "Sign Up" && <input type="text" placeholder="Your name" required />}
          <input type="email" placeholder="Your email" required />
          <input type="password" placeholder="Password" required />
        </div>

        <button type="submit" className="btn">
          {currState === "Sign Up" ? "Create account" : "Login"}
        </button>

        <div className="social-login-separator">
          <hr />
          <span>or</span>
          <hr />
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