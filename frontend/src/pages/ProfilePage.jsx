import React, { useContext, useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import Announcements from '../components/Announcement'
import Navbar from '../components/NavBar'
import AuthContext from '../context/AuthContext'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'

const ProfileInfo = ({ user, onSendEmailClick }) => {
  return (
    <div className="card">
      <img src={user.profile_picture} className="card-img-top" alt="Profile" />
      <div className="card-body">
        <h5 className="card-title text-success">{user.fullname}</h5>
        <button className="btn btn-success" onClick={onSendEmailClick}>
          Send a message via e-mail
        </button>
      </div>
    </div>
  )
}

const EnrolledCourses = ({ user }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title text-primary">Enrolled Courses</h5>
        <ul className="list-group">
          {user.courses.map((course) => (
            <li key={course.id} className="list-group-item">
              {course.title} - Instructor: {course.teacher}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const ProfilePage = () => {
  const { auth } = useContext(AuthContext)
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false) // State to control modal visibility
  const [emailContent, setEmailContent] = useState('') // State to hold the input email
  const [sending, setSending] = useState(false) // State for sending status
  const [message, setMessage] = useState('') // State for response message

  document.title = 'Profile page'

  const fetchCourseAnnouncements = async () => {
    const idToFetch = userId || auth.user.id
    try {
      const response = await axiosInstance.get(
        `user/get-announcements/${idToFetch}`
      )

      return response
    } catch (error) {
      console.error('Error fetching announcements:', error)
      return null
    }
  }

  // Function to fetch profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const idToFetch = userId || auth.user.id // Use userId from URL or current user
        const profileResponse = await axiosInstance.get(
          `get-user-profile/${idToFetch}/`
        )

        const courses = profileResponse.data.courses.map((course) => ({
          id: course.id,
          title: course.subject_name,
          teacher: course.teacher_first_name + ' ' + course.teacher_last_name,
        }))

        setUser({
          ...profileResponse.data,
          courses: courses,
        })

        setLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setLoading(false)
      }
    }

    fetchUserData()
  }, [auth.user, userId])

  const handleSendEmailClick = () => {
    setShowModal(true)
  }

  const handleSendInvitation = async () => {
    setSending(true)
    try {
      const response = await axiosInstance.post(
        'http://localhost:8000/api/invite-student/1/',
        { email: emailContent }
      )
      setMessage('Invitation sent successfully!')
    } catch (error) {
      console.error('Error sending invitation:', error)
      setMessage('Failed to Send a message.')
    }
    setSending(false)
  }

  if (loading) {
    return <div>Loading profile...</div> // Show loading while user data is being fetched
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-2">
          <Navbar />
        </div>
        <div className="col-md-10 col-10">
          <div className="mt-5 mb-5 row">
            <div className="col-md-4 col-12">
              <ProfileInfo
                user={user}
                onSendEmailClick={handleSendEmailClick}
              />
              <EnrolledCourses user={user} />
            </div>
            <div className="col-md-8 col-12">
              <Announcements fetchAnnouncements={fetchCourseAnnouncements} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for sending email */}
      <div
        className={`modal fade ${showModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Send a message</h5>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6 col-12">
                  <select
                    id="adress"
                    name="adress"
                    className="form-control"
                    // value={formData.subject}
                    // onChange={handleChange}
                    required
                  >
                    <option selected>Dear</option>
                    <option>Hi</option>
                    <option>Hello</option>
                  </select>
                </div>
                <div className="col-md-6 col-12">
                  <p className="text-bg-secondary text-light form-control">
                    ADOTT PROFIL USERFULLNAME
                  </p>
                </div>
              </div>
              <textarea
                className="form-control"
                placeholder="E-mail's content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
              {message && <p className="mt-2">{message}</p>}
            </div>
            <div className="modal-footer">
              <p className="text-bg-secondary text-light form-control">
                Best Regards, <br></br> {auth.user.fullname}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendInvitation}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send a message'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(ProfilePage)
