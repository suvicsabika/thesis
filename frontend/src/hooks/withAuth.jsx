import React from 'react'

import useAuthCheck from '../hooks/useAuthCheck'

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { loading, isAuthenticated } = useAuthCheck()

    if (loading) {
      return <div>Loading...</div> // Show a loading indicator
    }

    if (!isAuthenticated) {
      return <div>Please log in to view this page.</div> // Redirect or message if not authenticated
    }

    return <WrappedComponent {...props} />
  }
}

export default withAuth
