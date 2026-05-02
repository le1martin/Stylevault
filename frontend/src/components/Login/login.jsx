import React, { useState } from 'react';
import './Login.css';
import { assets } from '../../assets/assets'; 

const Login = () => { 
  const [currState, setCurrState] = useState("Login");

  return (
    <div className="login-page">
      <form className="login-container">



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

        
        
        {currState === "Login" 
          ? <p>New to Stylevault? <span onClick={() => setCurrState("Sign Up")}>Create account</span></p>
          : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
        }
      </form>
    </div>
  );
};

export default Login;