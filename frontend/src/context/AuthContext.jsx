import React, { createContext, useEffect, useState } from 'react'

import axiosInstance from '../utils/axiosConfig'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, loading: true })

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await fetchUser() // Check if the user is logged in
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setAuth((prev) => ({ ...prev, loading: false }))
      }
    }

    initializeAuth()
  }, [])

  const handleLogin = async (username, password) => {
    try {
      await axiosInstance.post(
        'token/',
        { username, password },
        { withCredentials: true }
      )
      await fetchUser() // Fetch user data after successful login
    } catch (error) {
      console.error('Error logging in:', error)
    }
  }

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('get-user-login/')
      const user = response.data
      setAuth((prev) => {
        if (prev.user !== user) {
          return { user, loading: false }
        }
        return prev
      })
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await axiosInstance.post('logout/')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setAuth({ user: null, loading: false })
    }
  }

  return (
    <AuthContext.Provider value={{ auth, handleLogin, handleLogout }}>
      {!auth.loading && children}{' '}
      {/* Render children only when auth is loaded */}
    </AuthContext.Provider>
  )
}

export default AuthContext
