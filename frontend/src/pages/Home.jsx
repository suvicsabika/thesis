import React, { useContext, useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import MyNavbar from '../components/NavBar'
import AuthContext from '../context/AuthContext'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FaBook } from 'react-icons/fa'

const CourseCard = ({
  id,
  title,
  teacher_first_name,
  teacher_last_name,
  room,
  unsubmitted_tasks,
}) => {
  return (
    <div className="col-md-4 mb-4">
      <Link to={`/course/${id}`} className="no-underline">
        <div className="card course-card">
          <div className="card-body">
            {/* Icon placed in top-right corner and rotated */}
            {unsubmitted_tasks > 0 ? <FaBook className="course-icon" /> : null}

            <h5 className="card-title">{title}</h5>
            <p className="card-subtitle instructor-subtitle">Instructor:</p>
            <p className="card-text instructor">
              <span className="instructor-first-name">
                {teacher_first_name}
              </span>
              <div className="card-bottom-half">
                <span className="instructor-last-name">
                  {teacher_last_name}
                </span>
                <span className="card-subtitle instructor-subtitle">
                  {room}
                </span>
              </div>
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}

const CourseBody = ({ courses, role }) => {
  return (
    <div className="container mt-4">
      <div className="row">
        {courses.length > 0 ? (
          courses.map((course, index) => (
            <CourseCard
              key={index}
              id={course.id}
              title={course.title}
              teacher_first_name={course.teacher_first_name}
              teacher_last_name={course.teacher_last_name}
              room={course.room}
              unsubmitted_tasks={course.unsubmitted_tasks}
            />
          ))
        ) : role === 'Student' ? (
          <div className="text-muted">
            There are no courses you are enrolled in. Speak with your Teachers
            to get invited!
          </div>
        ) : (
          <div className="text-muted">
            There are no courses that you are teaching in. As a Teacher, you can
            create one!
            <br></br>
          </div>
        )}
      </div>
    </div>
  )
}

const InformationAlert = ({ fullname, role, unsubmittedTasksCount }) => {
  return (
    <div className="alert alert-secondary m-5 row" role="alert">
      <div className="col-8">
        <h4 className="alert-heading">Welcome back {fullname}!</h4>
        <hr />
        {role === 'Teacher' ? (
          <Link to="/create-course" className="btn btn-primary ml-2">
            Create a course
          </Link>
        ) : null}
        <p className="mb-0">List of enrolled courses:</p>
      </div>
      <div className="col-4">
        {role === 'Student' &&
          (unsubmittedTasksCount > 0 ? (
            <p>
              You have{' '}
              <span style={{ color: 'red' }}>{unsubmittedTasksCount}</span>{' '}
              uncompleted assignments! Check out the{' '}
              <FaBook style={{ color: 'red' }} /> courses!
            </p>
          ) : (
            <p>
              You have done all the assignments across all your courses! Hurray!
            </p>
          ))}
      </div>
    </div>
  )
}

const Home = () => {
  const { auth } = useContext(AuthContext)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true) // Loading state for the auth data
  const [unsubmittedTasksCount, setUnsubmittedTasksCount] = useState(0)

  document.title = "Courses"

  useEffect(() => {
    const fetchCourses = async () => {
      if (!auth.user) return // Ensure user is available

      try {
        const response = await axiosInstance.get('courses/get-courses/')
        const courseData = response.data.courses.map((course) => ({
          id: course.id,
          title: course.subject_name,
          teacher_first_name: course.teacher_first_name,
          teacher_last_name: course.teacher_last_name,
          room: course.room,
          unsubmitted_tasks: course.unsubmitted_tasks,
        }))

        setCourses(courseData)

        // Calculate the total number of unsubmitted tasks across all courses
        const totalUnsubmittedTasks = courseData.reduce(
          (acc, course) => acc + course.unsubmitted_tasks,
          0
        )
        setUnsubmittedTasksCount(totalUnsubmittedTasks)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false) // Data is now loaded
      }
    }

    // Only fetch courses after auth is confirmed
    if (auth.user) {
      fetchCourses()
    }
  }, [auth.user])

  if (loading || !auth.user) {
    return <div>Loading...</div> // Ensure auth is fully ready before rendering
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-2">
          <MyNavbar />
        </div>
        <div className="col-md-10 col-10">
          <InformationAlert
            fullname={auth.user.fullname}
            role={auth.user.role}
            unsubmittedTasksCount={unsubmittedTasksCount} // Pass the total unsubmitted tasks count
          />
          <CourseBody courses={courses} role={auth.user.role} />
        </div>
      </div>
    </div>
  )
}

export default withAuth(Home)
