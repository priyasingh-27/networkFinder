"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login/Login.jsx";
import Search from "./components/Search/Search.jsx";
import "./App.css"

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("userToken")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("userToken")
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <div className="app">
        {isAuthenticated && (
          <nav className="navbar">
            <div className="navbar-content">
              <h1 className="app-title">Startup Network Finder</h1>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </nav>
        )}

        <div className="main-content">
          <Routes>
            <Route
              path="/login"
              element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/search" replace />}
            />
            <Route path="/search" element={isAuthenticated ? <Search /> : <Navigate to="/login" replace />} />
            <Route path="/" element={<Navigate to={isAuthenticated ? "/search" : "/login"} replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App

