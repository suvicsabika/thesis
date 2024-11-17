import React, { useContext } from 'react'

import { Navigate } from 'react-router-dom'

import AuthContext from '../context/AuthContext'

const ProtectedRoute = ({ element: Element, ...rest }) => {
  const { auth } = useContext(AuthContext)

  // Check if the user is authenticated
  if (!auth.user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />
  }

  // Render the protected component if authenticated
  return <Element {...rest} />
}

export default ProtectedRoute
