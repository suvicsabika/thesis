import React, { useEffect, useState } from 'react'

import { Link, useLocation, useParams } from 'react-router-dom'

import axiosInstance from '../utils/axiosConfig'
import { FaBook, FaChartBar, FaEdit, FaPeopleArrows } from 'react-icons/fa'

const CourseDetails = ({ role }) => {
  const { courseId } = useParams()
  const [course, setCourse] = useState({})
  const [teacherName, setTeacherName] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [error, setError] = useState(null)
  const [path, setPath] = useState(null)

  const location = useLocation()

  useEffect(() => {
    // Extract the "edit-course" part from the pathname
    const path = location.pathname.split('/')[1]
    setPath(path)
  }, [location])

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `courses-detailed/${courseId}/`
        )
        setCourse(response.data.course)
        setTeacherName(response.data.teacher_name)
        setSubjectName(response.data.subject_name)
      } catch (err) {
        console.error('Failed to fetch course details:', err)
        setError('Failed to load course details')
      }
    }
    fetchCourseDetails()
  }, [courseId])

  useEffect(() => {
    // Set document title: fallback to a default title if subjectName is missing
    document.title = subjectName
      ? `${subjectName} - Course Details`
      : 'Loading...'
  }, [subjectName])

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  if (!course.id) {
    return (
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
  return (
    <div className="card course-card mb-4 m-5 p-3">
      <div className="row">
        <div className="col-md-9 col-12">
          <div className="card-content" style={{ gap: '25px' }}>
            <div className="card-text-content">
              <h2 className="card-title">{subjectName}</h2>
              <p className="card-text instructor-first-name">
                Instructor: {teacherName}
              </p>
              <p className="card-text text-white">{course.description}</p>

              {(path === 'edit-course' ||
                path === 'course-grades' ||
                path === 'course-participants') && (
                <Link
                  to={`/course/${course.id}`}
                  className="btn btn-primary mb-2"
                >
                  <FaBook className="mr-2" />
                  <strong>Back to Course</strong>
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-3 col-12">
          <div
            className="card-buttons d-flex flex-column justify-content-between"
            style={{ height: '100%' }}
          >
            {role === 'Teacher' && (
              <>
                <Link
                  to={`/edit-course/${course.id}`}
                  className="btn btn-danger mb-2"
                >
                  <FaEdit className="mr-2" /> Edit or Delete
                </Link>
                <Link
                  to={`/course-grades/${course.id}`}
                  className="btn btn-warning"
                >
                  <FaChartBar className="mr-2" />
                  Course Grades
                </Link>
              </>
            )}
            <Link
              to={`/course-participants/${course.id}`}
              className="btn btn-info"
            >
              <FaPeopleArrows />
              Course Participants
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetails
