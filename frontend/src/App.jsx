import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom' 
import Navbar from './components/HomeNavbar/navbar'
import Home from './components/Home/home'
import Login from './components/Login/Login'
import Main from './components/Main/Main'
import site from './assets/site.png'


const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isMainPage = location.pathname === "/main";

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']")

    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    link.type = 'image/png'
    link.href = site
    
  }, [])

  return (
    <div className='app'>
      {!isLoginPage && !isMainPage && <Navbar />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/main' element={<Main />} />
      </Routes>
    </div>
  )
}

export default App