import React, { useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import ActionButton from '../components/ActionButton'
import Navbar from '../components/NavBar'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const GradeSubmissions = () => {
  const { taskId } = useParams()
  const [submissions, setSubmissions] = useState([])
  const [error, setError] = useState(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [chartData, setChartData] = useState({
    labels: ['Submitted', 'Not Submitted'],
    datasets: [
      {
        data: [0, 0], // Placeholder values
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  })

  // Define fetchSubmissions function outside of useEffect
  const fetchSubmissions = async () => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/submissions/`)

      setSubmissions(response.data.submissions)
      setTaskTitle(response.data.submissions[0]?.task_title || 'Unknown Task')
      calculateChartData(response.data.submissions)
    } catch (err) {
      setError('Failed to fetch submissions.')
      console.error(err)
    }
  }

  // Call fetchSubmissions on component mount or taskId change
  useEffect(() => {
    fetchSubmissions()
  }, [taskId])

  const calculateChartData = (submissions) => {
    const totalStudents = submissions.length
    const submittedCount = submissions.filter(
      (sub) => sub.status === 'Submitted'
    ).length
    const notSubmittedCount = totalStudents - submittedCount

    setChartData({
      labels: ['Submitted', 'Not Submitted'],
      datasets: [
        {
          data: [submittedCount, notSubmittedCount],
          backgroundColor: ['#36A2EB', '#FF6384'],
        },
      ],
    })
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.label || ''
            if (context.parsed > 0) {
              label += `: ${context.parsed}`
            }
            return label
          },
        },
      },
      datalabels: {
        color: '#fff',
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce(
            (acc, val) => acc + val,
            0
          )
          const percentage = ((value / total) * 100).toFixed(0) + '%'
          return percentage
        },
        anchor: 'center',
        align: 'center',
      },
    },
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
              Grade Submissions for Task: {taskTitle} (ID: {taskId})
            </h1>
            <div className="row">
              <div className="col-md-6 col-12">
                <h1 className="card-title text-success mb-3">
                  List of students who have the assignment:
                </h1>
                <table className="table">
                  <thead>
                    <tr className="table-success">
                      <th>Name</th>
                      <th>If submitted, see</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td>{submission.student}</td>
                        <td>
                          {submission.status !== 'Pending' &&
                          submission.status !== 'Overdue' ? (
                            <Link
                              to={`/grade-submissions/${taskId}/${submission.student_id}`}
                            >
                              <button className="btn btn-success">
                                {submission.status}
                              </button>
                            </Link>
                          ) : (
                            <button className="btn btn-secondary" disabled>
                              {submission.status}
                            </button>
                          )}
                        </td>
                        <td>{submission.grade || 'N/A'}</td>
                        <td>
                          <ActionButton
                            taskId={taskId}
                            assignmentId={submission.id}
                            onActionComplete={fetchSubmissions} // Pass fetchSubmissions to ActionButton
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="col-md-6 col-12">
                <p className="card-title text-success">Submission rate</p>
                <div style={{ maxWidth: '300px', margin: 'auto' }}>
                  <Pie data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(GradeSubmissions)
