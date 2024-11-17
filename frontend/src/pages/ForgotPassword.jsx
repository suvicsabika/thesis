import React, { useState } from 'react'

import drawing from '../media/studying_drawing.jpg'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'

const ForgotPassword = () => {
  document.title = 'Forgot Password'

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await axiosInstance.post('password-reset/', {
        email,
      })
      setMessage(response.data.message)
    } catch (err) {
      setError('An error occurred. Please try again.')
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
                  <p className="text-muted">
                    If you have forgotten your password, please enter the email
                    address associated with your account. If the email exists in
                    our system, we will send you instructions to reset your
                    password.
                  </p>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary mt-3">
                      Submit
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

export default ForgotPassword
