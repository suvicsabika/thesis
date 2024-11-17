import React, { useContext, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import AuthContext from '../context/AuthContext'
import '../index.css'
import drawing from '../media/studying_drawing.jpg'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { auth, handleLogin } = useContext(AuthContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  document.title = 'Login'

  const handleUsernameChange = (event) => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await handleLogin(username, password)
    } catch (err) {
      console.error('Error logging in:', err)
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auth.user) {
      // Add a small delay before navigating
      const timer = setTimeout(() => {
        navigate('/home', { replace: true })
      }, 500) // Adjust delay as needed
      return () => clearTimeout(timer)
    }
  }, [auth.user, navigate])

  // Function to handle sending the email
  const handleSendEmail = () => {
    // Check if email is valid
    if (!email) {
      alert('Please enter a valid email address.')
      return
    }

    // Make the POST request to send the email
    axiosInstance
      .post('http://localhost:8000/api/invite-student/1/', { email: email })
      .then((response) => {
        // Handle success response
        alert('Email sent successfully!')
      })
      .catch((error) => {
        // Handle error response
        alert('Failed to send email. Please try again.')
        console.error(error)
      })
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-7">
          <div className="card mt-5 shadow-lg">
            <div className="row">
              <div className="row">
                <div className="col-7 logo-container">
                  <img
                    src={drawing}
                    className="rounded rounded-start logo-of-login"
                    alt="studying_drawing"
                  />
                </div>
                <div className="col-5">
                  <div className="card-body">
                    <h2 className="welcome-title  text-center">
                      Welcome back!
                    </h2>
                    <p className="text-center text-muted">
                      Please enter your details!
                    </p>
                    {error && (
                      <p className="text-danger text-center">{error}</p>
                    )}
                    {loading && (
                      <p className="text-muted text-center">Logging in...</p>
                    )}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <div className="form__group field">
                          <input
                            type="input"
                            className="form__field"
                            placeholder="Name"
                            name="username"
                            id="username"
                            value={username}
                            onChange={handleUsernameChange}
                            required
                          />
                          <label htmlFor="username" className="form__label">
                            Username
                          </label>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="form__group field">
                          <input
                            type="password"
                            className="form__field"
                            placeholder="Name"
                            name="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                          />
                          <label htmlFor="password" className="form__label">
                            Password
                          </label>
                        </div>
                      </div>
                      <p className="text-muted fs-6 text-end">
                        <a
                          href="/forgot"
                          className="link-secondary no-underline"
                        >
                          Forget password?
                        </a>
                      </p>
                      <div className="d-grid">
                        <button
                          type="submit"
                          className="form-control general-button  rounded submit px-3"
                          disabled={loading}
                        >
                          Sign In
                        </button>
                      </div>
                      <p className="text-muted fs-6 text-start mt-3">
                        <a
                          href="/register"
                          className="link-secondary no-underline"
                        >
                          Not enrolled? Click here to register as a student.
                        </a>
                      </p>
                    </form>
                  </div>
                </div>
                {/* </div>
              <div className="col-12">
                <h1>E-mail rendszer teszt Tamásnak</h1>
                <input
                  id="teszt_email"
                  type="text"
                  className="form-control"
                  placeholder="e-mail cím ahova küldeni szeretnél"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Update email state
                />
                <button className="btn btn-success" onClick={handleSendEmail}>
                  E-mail küldése
                </button>
              </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
