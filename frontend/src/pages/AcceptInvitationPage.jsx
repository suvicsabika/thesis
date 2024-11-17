import React, { useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'

const AcceptInvitationPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  // const [isAccepted, setIsAccepted] = useState(false)

  useEffect(() => {
    const acceptInvitation = async () => {
      // if (isAccepted) return // Prevent duplicate requests

      try {
        // setIsAccepted(true) // Set to true to prevent further requests
        const response = await axiosInstance.get(`/accept-invitation/${token}/`)
        const redirectUrl = response.data.redirect_url

        if (redirectUrl) {
          navigate(redirectUrl)
        } else {
          console.error('Redirect URL missing in the response.')
        }
      } catch (error) {
        console.error('Error accepting invitation:', error)
        //setIsAccepted(false) // Reset on error to allow retries if needed
      }
    }

    acceptInvitation()
  }, [token, navigate]) //, isAccepted]) // Add isAccepted to the dependency array

  return (
    <div>
      <p>Accepting invitation...</p>
    </div>
  )
}

export default withAuth(AcceptInvitationPage)
