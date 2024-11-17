import React, { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import Navbar from '../components/NavBar'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'
import { FaDownload } from 'react-icons/fa'

const GradeAnAssignment = () => {
  const [submission, setSubmission] = useState(null)
  const { taskId, submissionId } = useParams()
  const [feedback, setFeedback] = useState('')
  const [grade, setGrade] = useState('')
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axiosInstance.get(
          `grade-submission/${taskId}/${submissionId}/`
        )

        setSubmission(response.data.submission)

        // Pre-fill feedback and grade if the assignment is already graded
        if (response.data.grade) {
          setFeedback(response.data.teacher_feedback)
          setGrade(response.data.grade)
        }
      } catch (error) {
        console.error('Error fetching submission', error)
      }
    }

    fetchSubmission()
  }, [taskId, submissionId])

  // Check if the submission has already been graded
  const isAlreadyGraded = submission && submission.grade

  const handleGradeSubmit = async (e) => {
    e.preventDefault()
    try {
      // Use PUT for re-grading if grade already exists, otherwise POST
      const method = isAlreadyGraded ? 'put' : 'post'

      const response = await axiosInstance[method](
        `grade-submission/${taskId}/${submissionId}/`,
        { grade, teacher_feedback: feedback }
      )
      setAlert({ type: 'success', message: response.data.success })
      // Update submission data with the new grade and feedback
      setSubmission((prev) => ({ ...prev, grade, teacher_feedback: feedback }))
    } catch (error) {
      setAlert({ type: 'danger', message: 'Failed to grade submission' })
    }
  }

  if (!submission) {
    return <div>Loading...</div>
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-2">
          <Navbar />
        </div>
        <div className="col-md-10 col-10">
          <div className="mt-5 mb-5 p-3 tasks-card">
            <h1 className="card-title text-success mb-3">
              GRADING: {submission.student_name}'s submission for{' '}
              {submission.task_title}
            </h1>
            <h3 className="card-title text-success">Submitted files</h3>
            {submission.submitted_files &&
            submission.submitted_files.length > 0 ? (
              <ul>
                {submission.submitted_files.map((file, index) => (
                  <li key={index}>
                    {file.file_name}{' '}
                    <a
                      href={file.file}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaDownload
                        style={{ color: 'green' }}
                        size={16}
                      ></FaDownload>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">
                No additional files provided to this assignment.
              </p>
            )}
            <h3 className="card-title text-success">
              Student's comments on submission:
            </h3>
            <input
              type="text"
              className="form-control mb-3"
              value={submission.comments}
              disabled
            ></input>
            {alert && (
              <div className={`alert alert-${alert.type}`} role="alert">
                {alert.message}
              </div>
            )}
            <form onSubmit={handleGradeSubmit}>
              <h3 className="card-title text-success">Feedback to Student</h3>
              <textarea
                className="form-control mb-3"
                placeholder="Give constructive feedback"
                rows="3"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>
              <h3 className="card-title text-success">Grade</h3>
              <input
                type="number"
                className="form-control mb-3"
                placeholder="Grade in percentage (%)"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              ></input>
              <button type="submit" className="btn btn-success">
                {isAlreadyGraded ? 'Re-grade' : 'Save grade'}
              </button>
              {isAlreadyGraded && (
                <p className="text-muted">
                  The student has already been graded: You can still re-grade it
                  if you would like to and the system will notify{' '}
                  {submission.student_name} about their new grade.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(GradeAnAssignment)
