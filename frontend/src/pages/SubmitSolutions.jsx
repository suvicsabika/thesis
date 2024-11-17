import React, { useContext, useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import Navbar from '../components/NavBar'
import AuthContext from '../context/AuthContext'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FaDownload } from 'react-icons/fa'

const SubmitSolutions = () => {
  const { auth } = useContext(AuthContext)
  const { taskId } = useParams()
  const [task, setTask] = useState(null)
  const [assignmentDetails, setAssignmentDetails] = useState(null)
  const [files, setFiles] = useState([]) // Updated to handle multiple files
  const [submittedFiles, setSubmittedFiles] = useState([]) // Updated to handle multiple files
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')
  const [assignment_files, setAssignmentFiles] = useState([]) // Updated to handle multiple files

  const fetchTaskDetails = async () => {
    try {
      const taskResponse = await axiosInstance.get(`tasks/${taskId}/`)

      setTask(taskResponse.data.task_details)
      setAssignmentDetails(taskResponse.data.assignment_details)
      setAssignmentFiles(taskResponse.data.task_files)
      setSubmittedFiles(taskResponse.data.submitted_files)
    } catch (error) {
      console.error('Error fetching task details:', error)
    }
  }

  useEffect(() => {
    fetchTaskDetails()
  }, [auth.token, taskId])

  const handleFileChange = (e) => {
    setFiles(e.target.files) // Store multiple files
  }

  const handleCommentChange = (e) => {
    setComment(e.target.value)
  }

  const handleFileSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('files', file) // Append multiple files
    })
    formData.append('comments', comment)

    try {
      const response = await axiosInstance.post(
        `student-submit-files/${taskId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      await fetchTaskDetails() // Call the function to fetch task details again
      setMessage('Files and comment submitted successfully!')
      setAssignmentDetails((prev) => ({
        ...prev,
        status: 'Submitted',
      }))
    } catch (error) {
      console.error('Error submitting files and comment:', error)
      setMessage('Failed to submit files and comment. Please try again.')
    }
  }

  if (!task) {
    return <div>Loading task details...</div>
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-2">
          <Navbar />
        </div>
        <div className="col-md-10 col-10">
          <div className="mt-5 mb-5 card tasks-card task-item">
            <h3 className="card-title text-success">{task.title}</h3>
            <div>
              {/* <img
                src={'https://via.placeholder.com/60' || 'profile pic here'}
                alt="profile pic here"
              /> */}
              <p className="text-secondary">Assigned by: {task.assigned_by}</p>
            </div>
            <p className="card-text">{task.description}</p>
            {assignment_files && assignment_files.length > 0 ? (
              <ul>
                {assignment_files.map((file, index) => (
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
            <p className="text-muted">
              Deadline: {new Date(task.deadline).toLocaleString()}
            </p>

            <h5>Submit Your Work</h5>
            {assignmentDetails.status === 'Submitted' ||
            assignmentDetails.status === 'Graded' ? (
              <div className="alert alert-success">
                <p>You have already submitted this task.</p>
                <p>Status: {assignmentDetails.status}</p>
                <p>Submitted Files</p>
                {submittedFiles && submittedFiles.length > 0 ? (
                  <ul>
                    {submittedFiles.map((file, index) => (
                      <li key={index}>
                        {file.file_name} (submitted at{' '}
                        {new Date(file.upload_date).toLocaleString()})
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
                  <p>No files</p>
                )}
                <p>Grade: {assignmentDetails.grade || 'Not graded yet'}</p>
                <p>
                  Comments:{' '}
                  {assignmentDetails.teacher_feedback ||
                    'No feedback from the Assigner yet'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleFileSubmit} encType="multipart/form-data">
                <p> Status: {assignmentDetails.status}</p>
                {assignmentDetails.status === 'Overdue' && (
                  <p className="text-danger">
                    This assignment is overdue!{' '}
                    {assignmentDetails.is_late
                      ? `You are allowed to submit late until: ${new Date(
                          assignmentDetails.late_due_date
                        ).toLocaleString()}`
                      : 'Late submissions are not allowed.'}
                  </p>
                )}
                {(assignmentDetails.status === 'Pending' ||
                  assignmentDetails.is_late) && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="file" className="form-label">
                        Upload files for submission:
                      </label>
                      <input
                        type="file"
                        id="file"
                        className="form-control"
                        onChange={handleFileChange}
                        multiple // Allow multiple file selection
                        //required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="comment" className="form-label">
                        Add a comment for the teacher (optional):
                      </label>
                      <textarea
                        id="comment"
                        className="form-control"
                        rows="3"
                        value={comment}
                        onChange={handleCommentChange}
                        placeholder="Provide any additional feedback or notes for the teacher..."
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-success">
                      Submit Files and Comment
                    </button>
                  </>
                )}
              </form>
            )}
            {message && (
              <div className="alert alert-success">
                <p>{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(SubmitSolutions)
