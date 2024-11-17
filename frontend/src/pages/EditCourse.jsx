import React, { useContext, useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import CourseDetails from '../components/CourseDetails'
import Navbar from '../components/NavBar'
import AuthContext from '../context/AuthContext'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'

const EditCourse = () => {
  const [course, setCourse] = useState({
    description: '',
    room: '', // Added room field
  })
  const [loading, setLoading] = useState(true)
  const { courseId } = useParams()
  const { auth } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axiosInstance.get(`courses/${courseId}/`)
        setCourse({
          description: response.data.description,
          room: response.data.room || '', // Handle room field
        })
        setLoading(false)
      } catch (error) {
        console.error('Error fetching course data:', error)
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.put(`courses/${courseId}/`, course)
      alert('Course updated successfully!')
      navigate(`/course/${courseId}`)
    } catch (error) {
      console.error('Error updating course:', error)
      alert('Failed to update the course. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axiosInstance.delete(`courses/${courseId}/`)
        alert('Course deleted successfully!')
        navigate('/home')
      } catch (error) {
        console.error('Error deleting course:', error)
        alert('Failed to delete the course. Please try again.')
      }
    }
  }

  if (loading) {
    return <p>Loading course data...</p>
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-2">
          <Navbar />
        </div>
        <div className="col-md-10 col-10">
          <CourseDetails role={auth.user.role} />
          <div className="row">
            <div className="col-12 mb-4 p-3 task-card">
              <div className="card-body list-group list-group-flush list-group-item task-item">
                <h2 className="card-title text-danger">Edit Course</h2>
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label className="text-danger">Description</label>
                    <textarea
                      className="form-control "
                      name="description"
                      value={course.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-danger">Room</label>
                    <input
                      type="text"
                      className="form-control"
                      name="room"
                      value={course.room}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="task-bottom-half">
                    <button type="submit" className="btn btn-danger mt-3">
                      Save Changes
                    </button>
                    <button
                      className="btn btn-danger mt-3"
                      onClick={handleDelete}
                    >
                      Delete Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(EditCourse)
