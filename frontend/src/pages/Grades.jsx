import React, { useEffect, useState } from 'react'

import Navbar from '../components/NavBar'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'

const CourseTasks = ({ course_subject, teacher_name, tasks }) => (
  <div className="card mb-4">
    <div className="card-body">
      <h5 className="card-title text-danger">
        {course_subject} - {teacher_name}
      </h5>
      {tasks.length > 0 ? (
        <ul className="list-group">
          {tasks.map((task, index) => (
            <li key={index} className="list-group-item">
              <strong>{task.task_title}</strong>: {task.grade}
            </li>
          ))}
        </ul>
      ) : (
        <p>No graded tasks available for this course.</p>
      )}
    </div>
  </div>
)

const AverageGrades = ({ average_task_grade }) => (
  <div className="card mb-4">
    <div className="card-body">
      <h5 className="card-title text-danger">Average Task Grade</h5>
      <p>
        <strong>Average Task Grade:</strong>{' '}
        {average_task_grade ? average_task_grade.toFixed(2) : 'N/A'}
      </p>
    </div>
  </div>
)

const GradesPage = () => {
  const [gradesData, setGradesData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await axiosInstance.get('/student-grades/')
        setGradesData(response.data)
      } catch (err) {
        setError('Failed to fetch grades. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchGrades()
  }, [])

  if (loading) {
    return (
      <div className="container mt-5">
        <p>Loading grades...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <p>{error}</p>
      </div>
    )
  }

  const { task_grades, average_task_grade } = gradesData

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-2">
          <Navbar />
        </div>
        <div className="col-md-10 col-10">
          <div className="row mt-5 mb-5 card tasks-card">
            <div className="card-body">
              <h3 className="mb-4 card-title text-danger">Your Grades</h3>
              <div className="col-md-12 col-12">
                {Object.entries(task_grades).map(([courseKey, data], index) => (
                  <CourseTasks
                    key={index}
                    course_subject={data.course_subject}
                    teacher_name={data.teacher_name}
                    tasks={data.tasks}
                  />
                ))}
                <AverageGrades average_task_grade={average_task_grade} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(GradesPage)
