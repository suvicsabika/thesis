import React, { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import Navbar from '../components/NavBar'
import withAuth from '../hooks/withAuth'
import axiosInstance from '../utils/axiosConfig'

// Custom hook to manage task data and actions with consolidated state
const useTaskManager = (courseId) => {
  const [state, setState] = useState({
    tasks: [],
    task: {
      title: '',
      description: '',
      deadline: '',
      files: [], // New field to store uploaded files
    },
    editingTask: null,
    loading: false,
    error: null,
  })

  // Fetch tasks for the course
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setState((prevState) => ({ ...prevState, loading: true }))
        const response = await axiosInstance.get(`courses/${courseId}/tasks/`)
        setState((prevState) => ({
          ...prevState,
          tasks: response.data,
          loading: false,
        }))
      } catch (err) {
        setState((prevState) => ({
          ...prevState,
          error: 'Error fetching tasks.',
          loading: false,
        }))
      }
    }
    fetchTasks()
  }, [courseId])

  // Create or update task with files
  const handleSubmit = async (e) => {
    e.preventDefault()
    const { title, description, deadline, files } = state.task

    // Prepare the FormData object
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('deadline', deadline)

    // Append each file to the FormData
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file) // Ensure that files are added correctly
      })
    } else {
    }

    // Debugging FormData

    for (let pair of formData.entries()) {
    }

    try {
      if (state.editingTask) {
        await axiosInstance.put(
          `tasks-update-delete/${state.editingTask.id}/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      } else {
        for (let pair of formData.entries()) {
        }
        await axiosInstance.post(`courses/${courseId}/tasks/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }
      resetForm()
      await refreshTasks()
    } catch (err) {
      setState((prevState) => ({ ...prevState, error: 'Error saving task.' }))
    }
  }

  // Refresh tasks list
  const refreshTasks = async () => {
    try {
      const response = await axiosInstance.get(`courses/${courseId}/tasks/`)
      setState((prevState) => ({
        ...prevState,
        tasks: response.data,
      }))
    } catch (err) {
      setState((prevState) => ({
        ...prevState,
        error: 'Error refreshing tasks.',
      }))
    }
  }

  // Edit a task
  const handleEdit = (task) => {
    setState((prevState) => ({
      ...prevState,
      editingTask: task,
      task: {
        title: task.title,
        description: task.description,
        deadline: task.deadline,
      },
    }))
  }

  // Delete a task
  const handleDelete = async (taskId) => {
    try {
      await axiosInstance.delete(`tasks-update-delete/${taskId}/`)
      await refreshTasks()
    } catch (err) {
      setState((prevState) => ({ ...prevState, error: 'Error deleting task.' }))
    }
  }

  // Reset the form after creating or editing
  const resetForm = () => {
    setState((prevState) => ({
      ...prevState,
      task: { title: '', description: '', deadline: '' },
      editingTask: null,
    }))
  }

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files)

    setState((prevState) => ({
      ...prevState,
      task: { ...prevState.task, files: filesArray }, // Update state with selected files
    }))
  }

  return {
    state,
    setTask: (key, value) =>
      setState((prevState) => ({
        ...prevState,
        task: { ...prevState.task, [key]: value },
      })),
    handleFileChange, // Return the file change handler
    handleSubmit,
    handleEdit,
    handleDelete,
  }
}

// Stateless CreateTask component
const CreateTask = ({
  task,
  setTask,
  handleSubmit,
  handleFileChange,
  editingTask,
}) => (
  <>
    <h2 className="card-title text-warning">
      {editingTask ? 'Edit Task' : 'Create Task'}
    </h2>
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="form-group">
        <label className="card-title text-warning">Task Title</label>
        <input
          type="text"
          className="form-control"
          value={task.title}
          onChange={(e) => setTask('title', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="card-title text-warning">Task Description</label>
        <textarea
          className="form-control"
          value={task.description}
          onChange={(e) => setTask('description', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="card-title text-warning">Task Deadline</label>
        <input
          type="datetime-local"
          className="form-control"
          value={task.deadline}
          onChange={(e) => setTask('deadline', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="card-title text-warning">Upload Files</label>
        <input
          type="file"
          className="form-control"
          multiple
          onChange={handleFileChange} // Attach file change handler
          //required
        />
      </div>
      {/* <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="flexSwitchCheckDefault"
        ></input>
        <label class="form-check-label" for="flexSwitchCheckDefault">
          Is it for everyone?
        </label>
      </div>

      <div className="form-group">
        <label className="card-title text-warning">Select Students:</label>
        <select className="form-control">
          <option>**student_name**</option>
          <option>**student_name**</option>
          <option>**student_name**</option>
        </select>
      </div> */}
      <button type="submit" className="btn btn-warning mt-2">
        {editingTask ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  </>
)

// Stateless EditOrDeleteTask component
const EditOrDeleteTask = ({ tasks, handleEdit, handleDelete }) => (
  <>
    <h3 className="mt-4 card-title text-warning">Task List</h3>
    {tasks.length > 0 ? (
      <ul className="list-group">
        {tasks.map((task) => (
          <li key={task.id} className="list-group-item">
            <h5>{task.title}</h5>
            <p>{task.description}</p>
            <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
            <button
              onClick={() => handleEdit(task)}
              className="btn btn-warning mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(task.id)}
              className="btn btn-danger"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-muted">
        No assignments yet. Consider adding one for your Students!
      </p>
    )}
  </>
)

// Main component that manages tasks
const ManageTasks = () => {
  const { courseId } = useParams()
  const {
    state,
    setTask,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleFileChange,
  } = useTaskManager(courseId)

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-2">
          <Navbar />
        </div>
        <div className="col-md-10 col-10">
          <div className="row mt-5 mb-5 p-3 tasks-card">
            <div className="col-md-6 col-12">
              {state.error && <p className="text-danger">{state.error}</p>}
              {state.loading ? (
                <p>Loading...</p>
              ) : (
                <CreateTask
                  task={state.task}
                  setTask={setTask}
                  handleSubmit={handleSubmit}
                  editingTask={state.editingTask}
                  handleFileChange={handleFileChange}
                />
              )}
            </div>
            <div className="col-md-6 col-12">
              <EditOrDeleteTask
                tasks={state.tasks}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(ManageTasks)
