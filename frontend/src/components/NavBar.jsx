import React, { useContext, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import AuthContext from '../context/AuthContext'
import withAuth from '../hooks/withAuth'
import { FaBars, FaHome, FaListAlt, FaSignOutAlt, FaUser } from 'react-icons/fa'

import './NavBarStyle.css'

const MyNavbar = () => {
  const { auth, handleLogout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const logout = () => {
    handleLogout()
    navigate('/login')
  }

  return (
    <div
      className={`sidebar d-flex flex-column bg-dark text-white ${isCollapsed ? 'collapsed' : ''}`}
    >
      {/* Toggle Button */}
      <div className="sidebar-header py-4 px-3 d-flex justify-content-between">
        <h3 className={`text-center ${isCollapsed ? 'd-none' : ''}`}>Edusys</h3>
        <FaBars
          size={24}
          className="text-white cursor-pointer fabars"
          onClick={toggleSidebar}
        />
      </div>

      <nav className="nav flex-column px-3">
        <Link to="/home" className="nav-link text-white mb-4">
          <FaHome size={24} className="me-2" />
          <span className="nav-text">Home</span>
        </Link>

        {auth.user?.role === 'Student' && (
          <Link to="/grades" className="nav-link text-white mb-4">
            <FaListAlt size={24} className="me-2" />
            <span className="nav-text">Grades</span>
          </Link>
        )}

        {auth.user && (
          <>
            <Link to="/profile" className="nav-link text-white mb-4">
              <FaUser size={24} className="me-2" />
              <div className="name-and-role">
                <span className="nav-text">{auth.user.fullname}</span>
                <span className="nav-text">({auth.user.role})</span>
              </div>
            </Link>

            <div
              className="nav-link text-white mb-4"
              onClick={logout}
              style={{ cursor: 'pointer' }}
            >
              <FaSignOutAlt size={24} className="me-2" />
              <span className="nav-text">Logout</span>
            </div>
          </>
        )}

        {!auth.user && (
          <div className="nav-link text-white mb-4">
            <b>Loading...</b>
          </div>
        )}
      </nav>
    </div>
  )
}

export default withAuth(MyNavbar)
