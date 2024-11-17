import { useContext, useEffect, useState } from 'react'

import AuthContext from '../context/AuthContext'

const useAuthCheck = () => {
  const { auth } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate an asynchronous check
    const checkAuth = () => {
      if (auth.user) {
        setLoading(false) // Authenticated
      } else {
        setLoading(false) // Not authenticated
      }
    }

    checkAuth()
  }, [auth.user])

  return { loading, isAuthenticated: !!auth.user }
}

export default useAuthCheck
