import React, { useContext, useEffect, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import Navbar from '../components/NavBar'
import AuthContext from '../context/AuthContext'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'

const CreateCourse = () => {
  const { auth } = useContext(AuthContext)
  const [subjects, setSubjects] = useState([])
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    // schedule: '',
    room: '',
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  document.title = 'Create course'

  // Check user role, redirect if not a teacher
  useEffect(() => {
    if (auth.user && auth.user.role !== 'Teacher') {
      navigate('/403') // Redirect students or unauthorized users to 403 page
    }
  }, [auth.user, navigate])

  // Fetch available subjects when the component mounts
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get('subjects/')
        setSubjects(response.data)
      } catch (error) {
        console.error('Error fetching subjects:', error)
      }
    }

    fetchSubjects()
  }, [])

  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Handle course creation
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post('create-course/', formData)
      // Redirect to course page or show success message
      navigate('/home')
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data)
      } else {
        console.error('Error creating course:', error)
      }
    }
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-2">
          <Navbar />
        </div>
        <div className="col-md-10 col-10  mt-5 mb-5 card tasks-card">
          <h2 className="mt-5 card-title text-primary">Create a New Course</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="subject" className="card-title text-primary">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="form-control"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="" className="card-title text-primary">
                  Select a subject
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} - Grade {subject.grade} ({subject.category})
                  </option>
                ))}
              </select>
              <p className="text text-primary">
                Do you not see the Subject you teach in the list above? Register
                your Subject in the system:
              </p>
              <Link to="/subjects">
                <button className="btn btn-success">Create a Subject</button>
              </Link>
              <p className="text text-secondary">
                Please <u>note</u> that without a proper registration of a
                specific Subject, the system does <u>not</u> allow creating
                Courses for that Subject.
              </p>
              {errors.subject && (
                <div className="text-danger">{errors.subject}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="card-title text-primary">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control mb-3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Introduce your course with a few sentences..."
                required
              />
              {errors.description && (
                <div className="text-danger">{errors.description}</div>
              )}
            </div>

            {/* <div className="form-group">
              <label htmlFor="schedule" className="card-title text-primary">
                Schedule
              </label>
              <input
                type="datetime-local"
                id="schedule"
                name="schedule"
                className="form-control"
                value={formData.schedule}
                onChange={handleChange}
                required
              />
              {errors.schedule && (
                <div className="text-danger">{errors.schedule}</div>
              )} 
            </div>*/}

            <div className="form-group">
              <label htmlFor="room" className="card-title text-primary">
                Room
              </label>
              <input
                type="text"
                id="room"
                name="room"
                className="form-control"
                value={formData.room}
                onChange={handleChange}
                placeholder="Online or contact lesson? Teams/Zoom or Room No. 34?"
                required
              />
              {errors.room && <div className="text-danger">{errors.room}</div>}
            </div>

            <button type="submit" className="btn btn-primary mt-3 mb-3">
              Create Course
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default withAuth(CreateCourse) // Wrap the component with the HOC
