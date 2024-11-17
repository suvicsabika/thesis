import React, { useContext, useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import CourseDetails from '../components/CourseDetails'
import Navbar from '../components/NavBar'
import AuthContext from '../context/AuthContext'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'
import Papa from 'papaparse'

const CourseOverview = () => {
  const { courseId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const { auth } = useContext(AuthContext)

  // Fetch course overview
  const fetchCourseOverview = async () => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/overview/`)

      setData(response.data)
    } catch (err) {
      setError('Failed to fetch course overview')
    }
  }

  useEffect(() => {
    fetchCourseOverview()
  }, [courseId])

  const exportToCsv = (type) => {
    if (!data) return

    let csvData = []

    if (type === 'assignments') {
      csvData = Object.entries(data.student_grades).map(
        ([student, details]) => ({
          student: details.full_name,
          ...details.tasks.reduce(
            (acc, task) => ({ ...acc, [task.task_title]: task.grade }),
            {}
          ),
        })
      )
    } else if (type === 'finalGrades') {
      csvData = Object.entries(data.student_grades).map(
        ([student, details]) => ({
          student: details.full_name,
          averageGrade: details.average_grade || 'N/A',
        })
      )
    }

    // Convert data to CSV format
    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${type}_grades.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) return <div className="alert alert-danger">{error}</div>

  if (!data)
    return (
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )

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
              <div className="tasks-card mb-4 p-3 card-body list-group list-group-flush list-group-item task-item">
                <div className="task-bottom-half">
                  <h2 className="card-title text-warning">
                    Assignment Grades per Student
                  </h2>
                  <button
                    className="btn btn-warning"
                    onClick={() => exportToCsv('assignments')}
                  >
                    Export to .csv
                  </button>
                </div>
                <ul className="list-group list-group-flush">
                  {Object.keys(data.student_grades).length > 0 ? (
                    Object.entries(data.student_grades).map(
                      ([student, details]) => (
                        <li key={student} className="list-group-item">
                          <strong>{details.full_name}</strong>
                          <ul className="list-group mt-2">
                            {details.tasks.length > 0 ? (
                              details.tasks.map((task, index) => (
                                <li
                                  key={index}
                                  className="list-group-item border-0"
                                >
                                  {task.task_title}: {task.grade}
                                </li>
                              ))
                            ) : (
                              <li className="list-group-item">
                                No tasks found.
                              </li>
                            )}
                          </ul>
                        </li>
                      )
                    )
                  ) : (
                    <li className="list-group-item task-item">
                      No student grades available.
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="col-md-6 col-12">
              <div className="tasks-card mb-4 p-3 card-body list-group list-group-flush list-group-item task-item">
                <div className="task-bottom-half">
                  <h2 className="card-title text-warning">
                    Final Course Grades
                  </h2>
                  <button
                    className="btn btn-warning"
                    onClick={() => exportToCsv('finalGrades')}
                  >
                    Export to .csv
                  </button>
                </div>
                <ul className="list-group list-group-flush">
                  {Object.keys(data.student_grades).length > 0 ? (
                    Object.entries(data.student_grades).map(
                      ([student, details]) => (
                        <li key={student} className="list-group-item">
                          <strong>{details.full_name}</strong> - Average Grade:{' '}
                          {details.average_grade || 'N/A'}
                        </li>
                      )
                    )
                  ) : (
                    <li className="list-group-item task-item">
                      <p className="text-muted mb-0">
                        No final grades available till a Teacher grades at least
                        one assignment.
                      </p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(CourseOverview)
