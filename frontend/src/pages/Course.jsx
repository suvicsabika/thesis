import React, { useContext, useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import Announcements from '../components/Announcement'
import CourseDetails from '../components/CourseDetails'
import Navbar from '../components/NavBar'
import AuthContext from '../context/AuthContext'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'

const Tasks = ({ tasks, role, courseId }) => {
  return (
    <div className="tasks-card mb-4 p-3">
      <div className="task-bottom-half">
        <h3 className="card-title text-success">Tasks</h3>
        {role === 'Teacher' ? (
          <Link
            to={`/manage-task/${courseId}`}
            className="btn btn-warning ml-2"
          >
            Manage Tasks!
          </Link>
        ) : null}
      </div>
      {tasks.length > 0 ? (
        <ul className="list-group list-group-flush">
          {tasks.map((task, index) => (
            <li key={index} className="list-group-item task-item">
              <strong className="task-title">{task.title}</strong>
              <p className="task-description">{task.description}</p>
              <div className="">
                <div className="row">
                  <div className="col-md-6 col-12">
                    <span className="task-deadline">
                      Deadline: {new Date(task.deadline).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-md-6 col-12">
                    {role === 'Teacher' ? (
                      <Link
                        to={`/grade-submissions/${task.id}`}
                        className="btn btn-warning ml-2"
                      >
                        Grade Submissions
                      </Link>
                    ) : (
                      <Link to={`/task/${task.id}`} className="btn btn-success">
                        Submit solutions
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">
          There are no Tasks currently associated with this Course! Hurray!
        </p>
      )}
    </div>
  )
}

const CoursePage = () => {
  const [tasks, setTasks] = useState([])
  const { courseId } = useParams()
  const { auth } = useContext(AuthContext)

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axiosInstance.get(
          `courses-detailed/${courseId}/`
        )

        setTasks(response.data.tasks)
      } catch (error) {
        console.error('Error fetching course data:', error)
      }
    }

    fetchCourseData()
  }, [courseId])

  const fetchCourseAnnouncements = async () => {
    try {
      const response = await axiosInstance.get(
        `course-announcements/${courseId}/`
      )
      return response
    } catch (error) {
      console.error('Error fetching course announcements:', error)
      return null
    }
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
            <div className="col-md-6 col-12">
              <Announcements
                courseId={courseId}
                fetchAnnouncements={fetchCourseAnnouncements}
              />
            </div>
            <div className="col-md-6 col-12">
              <Tasks tasks={tasks} role={auth.user.role} courseId={courseId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(CoursePage) // Wrap the component with the HOC
