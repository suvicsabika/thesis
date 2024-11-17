import React, { useState } from 'react'

import axiosInstance from '../utils/axiosConfig'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Modal from 'react-modal'

// Import your axios instance
import './ModalStyles.css'

// Set the root element for accessibility
Modal.setAppElement('#root')

const ActionButton = ({ taskId, assignmentId, onActionComplete }) => {
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false)
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  // Modal open/close handlers
  const openUnassignModal = () => setIsUnassignModalOpen(true)
  const closeUnassignModal = () => setIsUnassignModalOpen(false)

  const openExtendModal = () => setIsExtendModalOpen(true)
  const closeExtendModal = () => setIsExtendModalOpen(false)

  const handleDateChange = (e) => setSelectedDate(e.target.value)

  const handleExtendDueDate = async () => {
    if (!selectedDate) {
      alert('Please select a due date before extending.')
      return
    }
    try {
      await axiosInstance.patch(
        `/tasks/${taskId}/submissions/${assignmentId}/`,
        {
          late_due_date: selectedDate,
        }
      )

      onActionComplete() // Notify parent to refresh data
      closeExtendModal()
    } catch (error) {
      console.error('Error extending due date:', error)
      alert('Failed to extend the due date. Please try again.')
    }
  }

  const handleUnassign = async () => {
    try {
      await axiosInstance.delete(
        `/tasks/${taskId}/submissions/${assignmentId}/`
      )

      onActionComplete() // Notify parent to refresh data
      closeUnassignModal()
    } catch (error) {
      console.error('Error unassigning task:', error)
      alert('Failed to unassign the task. Please try again.')
    }
  }

  return (
    <div className="d-flex flex-column align-items-center">
      {/* Action Button with Dropdown */}
      <div className="dropdown">
        <button
          className="btn btn-primary dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Options
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <li>
            <button className="dropdown-item" onClick={openUnassignModal}>
              Unassign
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={openExtendModal}>
              Extend Due Date
            </button>
          </li>
        </ul>
      </div>

      {/* Unassign Modal */}
      <Modal
        isOpen={isUnassignModalOpen}
        onRequestClose={closeUnassignModal}
        className="custom-modal-content"
        overlayClassName="custom-modal-overlay"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Unassign</h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeUnassignModal}
            ></button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to unassign this task?</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={handleUnassign}>
              Yes, Unassign
            </button>
            <button className="btn btn-secondary" onClick={closeUnassignModal}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Extend Due Date Modal */}
      <Modal
        isOpen={isExtendModalOpen}
        onRequestClose={closeExtendModal}
        className="custom-modal-content"
        overlayClassName="custom-modal-overlay"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Extend Due Date</h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeExtendModal}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="dueDate" className="form-label">
                Select New Due Date:
              </label>
              <input
                type="date"
                id="dueDate"
                className="form-control"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-success" onClick={handleExtendDueDate}>
              Extend
            </button>
            <button className="btn btn-secondary" onClick={closeExtendModal}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ActionButton
