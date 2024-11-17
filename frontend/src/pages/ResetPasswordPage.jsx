import React, { useState } from 'react'

import { useParams } from 'react-router-dom'

import drawing from '../media/studying_drawing.jpg'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'

const ResetPasswordPage = () => {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await axiosInstance.post(
        `password-reset-confirm/${token}/`,
        { password }
      )
      setMessage(response.data.message)
    } catch (err) {
      setError(
        'The reset link is invalid or expired. Please request a new link.'
      )
    }
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-9">
          <div className="card mt-5 shadow-lg">
            <div className="row">
              <div className="col-6 logo-container">
                <img
                  src={drawing}
                  className="rounded rounded-start logo-of-login"
                  alt="Studying Drawing"
                />
              </div>
              <div className="col-6">
                <div className="card-body">
                  <h1>Reset Password</h1>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="password">New Password</label>
                      <input
                        type="password"
                        id="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary mt-3">
                      Reset Password
                    </button>
                  </form>
                  {message && (
                    <div className="alert alert-success mt-3">{message}</div>
                  )}
                  {error && (
                    <div className="alert alert-danger mt-3">{error}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
