import React, { useContext, useEffect, useState } from 'react'

import Navbar from '../components/NavBar'
import AuthContext from '../context/AuthContext'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'

const CreateSubject = () => {
  const { auth } = useContext(AuthContext) // Get the authentication context
  const [subjects, setSubjects] = useState([]) // State for storing subjects
  const [newSubject, setNewSubject] = useState({
    name: '',
    grade: '',
    category: '',
  }) // New subject state
  const [loading, setLoading] = useState(true) // Loading state
  const [error, setError] = useState('') // Error state
  const [orderBy, setOrderBy] = useState('grade') // Sorting field state

  document.title = "Create subject"

  // Fetch subjects from the API
  const fetchSubjects = async (orderByField = 'grade') => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        `subjects/?order_by_field=${orderByField}`
      ) // Use axiosInstance with the dynamic sorting
      setSubjects(response.data)
      setLoading(false)
    } catch (err) {
      setError('Error fetching subjects')
      setLoading(false)
    }
  }

  // Initial fetch of subjects when the component mounts
  useEffect(() => {
    fetchSubjects(orderBy)
  }, [orderBy])

  // Handle form submission to add a new subject
  const handleAddSubject = async (e) => {
    e.preventDefault()
    try {
      const response = await axiosInstance.post('subjects/', newSubject) // Use axiosInstance

      // Add the new subject to the list
      setSubjects((prevSubjects) => [...prevSubjects, response.data])
      setNewSubject({ name: '', grade: '', category: '' }) // Reset form
    } catch (err) {
      setError('Error adding subject')
    }
  }

  // Handle table header click for sorting
  const handleSort = (field) => {
    setOrderBy(field) // Update the orderBy state to trigger sorting
  }

  // Display loading or error message
  if (loading) {
    return <p>Loading subjects...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-2">
          <Navbar />
        </div>
        <div className="col-md-10 col-10 mt-5 mb-5 card tasks-card">
          <div className="row">
            <div className="col-md-6 col-12">
              <h3 className="mb-4 card-title text-success">
                Existing Subjects in the system (click for sort):
              </h3>
              <table className="table">
                <thead>
                  <tr className="table-success">
                    <th
                      onClick={() => handleSort('name')}
                      style={{ cursor: 'pointer' }}
                    >
                      Name
                    </th>
                    <th
                      onClick={() => handleSort('grade')}
                      style={{ cursor: 'pointer' }}
                    >
                      Grade
                    </th>
                    <th
                      onClick={() => handleSort('category')}
                      style={{ cursor: 'pointer' }}
                    >
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.name}</td>
                      <td>{subject.grade}</td>
                      <td>{subject.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6 col-12">
              <h3 className="mb-4 card-title text-success">
                Create a new Subject in the system:
              </h3>
              <div className="mt-2 alert alert-success">
                <p className="text text-muted">
                  Some general information about creating a Subject:
                </p>
                <ul>
                  <li>
                    You can <u>not</u> create subjects which already registered
                    in system.
                  </li>
                  <li>
                    Our administrator will check the given subject and allow it
                    to be taught to Students, in 2-3 work days. It is suggested
                    to do the administration 1-2 weeks before your course(s)
                    start.
                  </li>
                </ul>
              </div>
              <form onSubmit={handleAddSubject}>
                <div className="mb-3">
                  <label
                    htmlFor="name"
                    className="form-label card-title text-success"
                  >
                    Subject Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={newSubject.name}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="grade"
                    className="form-label card-title text-success"
                  >
                    Grade
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="grade"
                    value={newSubject.grade}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, grade: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="category"
                    className="form-label card-title text-success"
                  >
                    Category
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="category"
                    value={newSubject.category}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, category: e.target.value })
                    }
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success mb-2">
                  Add Subject
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(CreateSubject) // Wrap the component with the HOC
