import React, { useState } from 'react'

import drawing from '../media/studying_drawing.jpg'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    first_name: '',
    last_name: '',
    profile_picture: null, // Added for profile picture
  })

  document.title = 'Register'

  const handleChange = (event) => {
    const { name, value, type, files } = event.target // Extract type and files
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value, // Handle file input
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData() // Create FormData object

    // Append each field to FormData
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key])
    })

    try {
      const response = await axiosInstance.post('register/', data, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      })

      // Clear form fields upon successful registration
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        date_of_birth: '',
        first_name: '',
        last_name: '',
        profile_picture: null, // Reset profile picture
      })

      alert('Registration successful')
    } catch (error) {
      console.error('Registration error:', error.message)
      alert('Registration failed')
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
                  alt="studying_drawing"
                />
              </div>
              <div className="col-6">
                <div className="card-body">
                  <h2 className="card-title text-center">Register</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Username"
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="E-mail address"
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Password"
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm Password"
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="date"
                        className="form-control"
                        id="dateOfBirth"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        required
                        placeholder="Date of birth"
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        placeholder="First name"
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        placeholder="Last name"
                      />
                    </div>
                    <div className="mb-3">
                      <label for="profilePicture">Profile picture</label>
                      <input
                        type="file" // File input for profile picture
                        className="form-control"
                        id="profilePicture"
                        name="profile_picture"
                        onChange={handleChange}
                        // required
                        placeholder="Profile picture"
                      />
                    </div>
                    <div className="d-grid">
                      <button
                        type="submit"
                        className="form-control btn btn-outline-secondary rounded submit px-3"
                      >
                        Register
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
