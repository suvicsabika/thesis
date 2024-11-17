import React, { useContext, useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import CourseDetails from '../components/CourseDetails'
import Navbar from '../components/NavBar'
import AuthContext from '../context/AuthContext'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FaTrash } from 'react-icons/fa'

const CourseParticipants = ({ courseId, role }) => {
  const { auth } = useContext(AuthContext)
  const [teacher, setTeacher] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isInvitationPopupOpen, setInvitationPopupOpen] = useState(false)
  const [invitationEmail, setInvitationEmail] = useState('')
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axiosInstance.get(
          `course/${courseId}/participants/`
        )
        setTeacher(response.data.teacher)
        setStudents(response.data.students)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching participants:', error)
        setLoading(false)
      }
    }

    fetchParticipants()
  }, [courseId])

  if (loading) {
    return <p>Loading participants...</p>
  }

  const handleRemoveStudent = async (studentId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this Student from this Course?'
      )
    ) {
      try {
        await axiosInstance.delete(
          `course/${courseId}/participants/${studentId}/`
        )
        // Remove the student from the local state
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.id !== studentId)
        )
      } catch (error) {
        console.error('Error removing student:', error)
      }
    }
  }

  const toggleInvitationPopup = () => {
    setInvitationPopupOpen(!isInvitationPopupOpen)
  }

  const handleSendInvitation = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post(`send-invitation/${courseId}/`, {
        email: invitationEmail,
      })
      setInvitationPopupOpen(false) // Close the popup
      setShowSuccessAlert(true) // Show success alert
      setInvitationEmail('') // Clear email input

      // Hide alert after 3 seconds
      setTimeout(() => setShowSuccessAlert(false), 3000)
    } catch (error) {
      console.error('Error sending invitation:', error)
    }
  }

  return (
    <div className="card tasks-card mb-4 p-3">
      <div className="card-body">
        <div className="row">
          <div
            className={
              auth.user.role === 'Teacher' ? 'col-md-6 col-12' : 'col-12'
            }
          >
            <h3 className="card-title text-info">
              Course Participants, click on their name to checkout their unique
              Profilepage!
            </h3>
          </div>
          {auth.user.role === 'Teacher' ? (
            <div className="col-md-6 col-12">
              <h3 className="card-title text-info">
                Want to invite more people to the Course? Send them an
                invitation e-mail!
              </h3>
              <button
                className="btn btn-info text-white"
                onClick={toggleInvitationPopup}
              >
                <strong>Send invitation e-mail</strong>
              </button>
            </div>
          ) : null}
        </div>
        {/* Invitation Popup */}
        {isInvitationPopupOpen && (
          <div className="popup-overlay active">
            <div className="popup-window">
              <button className="close-btn" onClick={toggleInvitationPopup}>
                &times;
              </button>
              <h2 className="popup-title">Send Invitation Email</h2>
              <form onSubmit={handleSendInvitation}>
                <div className="mb-3">
                  <div className="form__group field">
                    <input
                      type="email"
                      className="form__field"
                      placeholder="Student Email"
                      name="invitationEmail"
                      id="invitationEmail"
                      required
                      value={invitationEmail}
                      onChange={(e) => setInvitationEmail(e.target.value)}
                    />
                    <label htmlFor="invitationEmail" className="form__label">
                      Student Email
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                  Send Invitation
                </button>
              </form>
            </div>
          </div>
        )}

        {showSuccessAlert && (
          <div className="alert alert-success mt-3" role="alert">
            Invitation email sent successfully!
          </div>
        )}
        <h4 className="card-title text-info">Teachers/Instructors</h4>
        {teacher ? (
          <ul className="list-group list-group-flush">
            <li className="list-group-item task-item">
              <div key={teacher.id}>
                <Link to={`/profile/${teacher.id}`} className="no-underline">
                  <strong className="task-title">{teacher.name}</strong>
                </Link>
              </div>
            </li>
          </ul>
        ) : (
          <p className="text-muted">No teacher found for this course.</p>
        )}
        {/* Display students */}
        <h4 className="card-title text-info full-text-line">
          Students/Participants
        </h4>
        {students.length > 0 ? (
          <ul className="list-group list-group-flush">
            {students.map((student) => (
              <li key={student.id} className="list-group-item task-item">
                <div className="task-bottom-half">
                  <Link to={`/profile/${student.id}`} className="no-underline">
                    <strong className="task-title">{student.name}</strong>
                  </Link>
                  {role === 'Teacher' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveStudent(student.id)}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No students enrolled in this course.</p>
        )}
      </div>
    </div>
  )
}

const CoursePage = () => {
  const { courseId } = useParams()
  const { auth } = useContext(AuthContext)

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-2">
          <Navbar />
        </div>
        <div className="col-md-10 col-10">
          <CourseDetails role={auth.user.role} />
          <div className="row">
            <div className="col-12">
              <CourseParticipants courseId={courseId} role={auth.user.role} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(CoursePage) // Wrap the component with the HOC
