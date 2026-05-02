import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom' 
import Navbar from './components/HomeNavbar/navbar'
import Header from './components/Home/home'
import Login from './components/Login/Login'

const App = () => {
  const location = useLocation();

  return (
    <div className='app'>
      {location.pathname !== "/login" && <Navbar />}
      
      <Routes>
        <Route path='/' element={<Header />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </div>
  )
}

export default App