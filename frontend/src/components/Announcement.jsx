import React, { useEffect, useState } from 'react'

import { useLocation } from 'react-router-dom'

import axiosInstance from '../utils/axiosConfig'
import {
  FaAngry,
  FaRegComment,
  FaRegThumbsDown,
  FaSadCry,
  FaSmile,
  FaThumbsUp,
} from 'react-icons/fa'

import './Announcements.css'

const Announcements = ({ courseId, fetchAnnouncements }) => {
  const [announcements, setAnnouncements] = useState([])
  const [reactions, setReactions] = useState([])
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [userReactions, setUserReactions] = useState({})
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('')
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('')

  const [path, setPath] = useState(null)

  const location = useLocation()

  useEffect(() => {
    // Extract the "edit-course" part from the pathname
    const path = location.pathname.split('/')[1]
    setPath(path)
  }, [location])

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen)
  }

  const handleCommentChange = (e) => {
    setNewComment(e.target.value)
  }

  const handleReactionClick = async (reactionType, announcementId) => {
    if (userReactions[announcementId] === reactionType) return // Prevent re-reacting

    try {
      await axiosInstance.post(`announcements/${announcementId}/reactions/`, {
        announcement: announcementId,
        reaction_type: reactionType,
      })
      // Fetch updated reactions for the announcement
      const response = await axiosInstance.get(
        `announcements/${announcementId}/reactions/`
      )
      setReactions((prevReactions) => [
        ...prevReactions.filter(
          (reaction) => reaction.announcement !== announcementId
        ),
        ...response.data.reactions,
      ])
      // Update user reactions
      setUserReactions((prevReactions) => ({
        ...prevReactions,
        [announcementId]: reactionType,
      }))
    } catch (error) {
      console.error('Error submitting reaction:', error)
    }
  }

  const submitComment = async (announcementId) => {
    if (!newComment) return
    try {
      await axiosInstance.post(`announcements/${announcementId}/comments/`, {
        announcement: announcementId,
        content: newComment,
      })
      // Directly fetch and update comments for the specific announcement
      const response = await axiosInstance.get(
        `announcements/${announcementId}/comments/`
      )
      setComments((prevComments) => [
        ...prevComments.filter(
          (comment) => comment.announcement !== announcementId
        ),
        ...response.data.comments,
      ])
      setNewComment('') // Clear comment input
    } catch (error) {
      console.error('Error submitting comment:', error)
    }
  }

  const submitAnnouncement = async (e) => {
    e.preventDefault()
    if (!newAnnouncementTitle || !newAnnouncementContent) return
    try {
      const response = await axiosInstance.post(
        `course-announcements/${courseId}/`,
        {
          title: newAnnouncementTitle,
          content: newAnnouncementContent,
        }
      )
      const newAnnouncement = response.data // Get the new announcement data
      togglePopup() // Close the pop-up after submission
      setNewAnnouncementTitle('')
      setNewAnnouncementContent('')
      // Add the new announcement to the current list without relying on fetchAnnouncements
      setAnnouncements((prevAnnouncements) => [
        newAnnouncement,
        ...prevAnnouncements,
      ])
    } catch (error) {
      console.error('Error submitting announcement:', error)
    }
  }

  useEffect(() => {
    const getAnnouncements = async () => {
      try {
        const response = await fetchAnnouncements()
        const announcementsData = response.data.announcements
        const reactionsData = response.data.reactions
        const commentsData = response.data.comments

        setAnnouncements(announcementsData)
        setReactions(reactionsData)
        setComments(commentsData)

        // Set user reactions
        const userReactionsMap = reactionsData.reduce((map, reaction) => {
          if (!map[reaction.announcement]) {
            map[reaction.announcement] = reaction.reaction_type
          }
          return map
        }, {})
        setUserReactions(userReactionsMap)
      } catch (error) {
        console.error('Error fetching announcements:', error)
      }
    }

    getAnnouncements()
  }, [fetchAnnouncements])

  return (
    <div className="announcement-card mb-4 p-3">
      <div className="card-body">
        <div className="announcement-bottom-half">
          <h3 className="card-title text-warning">Announcements</h3>
          {path !== 'profile' && (
            <button className="btn btn-primary mb-3" onClick={togglePopup}>
              Post Announcement
            </button>
          )}
        </div>
        {/* Keep the popup in the DOM and toggle its visibility */}
        <div className={`popup-overlay ${isPopupOpen ? 'active' : ''}`}>
          <div className="popup-window">
            <button className="close-btn" onClick={togglePopup}>
              &times;
            </button>
            <h2 className="announcement-title">Post New Announcement</h2>
            <form onSubmit={submitAnnouncement}>
              <div className="mb-3">
                <div className="form__group field">
                  <input
                    type="input"
                    className="form__field"
                    placeholder="Announcement Title"
                    name="announcementTitle"
                    id="announcementTitle"
                    required
                    value={newAnnouncementTitle}
                    onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                  />
                  <label htmlFor="announcementTitle" className="form__label">
                    Announcement Title
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <div className="form__group field">
                  <input
                    type="text"
                    className="form__field"
                    placeholder="Announcement Comment"
                    name="announcementContent"
                    id="announcementContent"
                    value={newAnnouncementContent}
                    required
                    onChange={(e) => setNewAnnouncementContent(e.target.value)}
                  />
                  <label htmlFor="announcementContent" className="form__label">
                    Announcement Comment
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Submit
              </button>
              <p className="text-muted mt-1 mb-0">
                This action will notify all the Students associated with this
                Course.
              </p>
            </form>
          </div>
        </div>
        {announcements.length > 0 ? (
          <ul className="list-group list-group-flush">
            {announcements.map((announcement) => (
              <li
                key={announcement.id}
                className="list-group-item announcement-item"
              >
                <div className="announcement-header">
                  <strong className="announcement-title">
                    {announcement.title}
                  </strong>
                  <span className="text-muted">
                    Posted by {announcement.user_full_name} on{' '}
                    {new Date(announcement.date).toLocaleString()}
                  </span>
                </div>
                <p className="announcement-content">{announcement.content}</p>

                {/* Reactions section */}
                <div className="reactions mt-2">
                  <div>
                    <button
                      onClick={() =>
                        handleReactionClick('like', announcement.id)
                      }
                      className={`btn ${userReactions[announcement.id] === 'like' ? 'btn-success' : 'btn-outline-success'}`}
                    >
                      <FaThumbsUp /> Like
                    </button>
                    <button
                      onClick={() =>
                        handleReactionClick('dislike', announcement.id)
                      }
                      className={`btn ${userReactions[announcement.id] === 'dislike' ? 'btn-danger' : 'btn-outline-danger'}`}
                    >
                      <FaRegThumbsDown /> Dislike
                    </button>
                    <button
                      onClick={() =>
                        handleReactionClick('happy', announcement.id)
                      }
                      className={`btn ${userReactions[announcement.id] === 'happy' ? 'btn-warning' : 'btn-outline-warning'}`}
                    >
                      <FaSmile /> Happy
                    </button>
                    <button
                      onClick={() =>
                        handleReactionClick('sad', announcement.id)
                      }
                      className={`btn ${userReactions[announcement.id] === 'sad' ? 'btn-primary' : 'btn-outline-primary'}`}
                    >
                      <FaSadCry /> Sad
                    </button>
                    <button
                      onClick={() =>
                        handleReactionClick('angry', announcement.id)
                      }
                      className={`btn ${userReactions[announcement.id] === 'angry' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                    >
                      <FaAngry /> Angry
                    </button>
                  </div>
                  {reactions.filter(
                    (reaction) => reaction.announcement === announcement.id
                  ).length > 0 ? (
                    reactions
                      .filter(
                        (reaction) => reaction.announcement === announcement.id
                      )
                      .map((reaction) => (
                        <span
                          key={reaction.id}
                          className="badge bg-warning text-dark mx-1"
                        >
                          {reaction.reaction_type === 'like' ? (
                            <FaThumbsUp className="reaction-icon" />
                          ) : reaction.reaction_type === 'dislike' ? (
                            <FaRegThumbsDown className="reaction-icon" />
                          ) : reaction.reaction_type === 'happy' ? (
                            <FaSmile className="reaction-icon" />
                          ) : reaction.reaction_type === 'sad' ? (
                            <FaSadCry className="reaction-icon" />
                          ) : (
                            <FaAngry className="reaction-icon" />
                          )}
                          {reaction.user_full_name}
                        </span>
                      ))
                  ) : (
                    <span className="text-muted">No reactions yet</span>
                  )}
                </div>

                {/* Comments section */}
                <div className="comments mt-3">
                  <div className="mt-3">
                    <textarea
                      value={newComment}
                      onChange={handleCommentChange}
                      className="form-control"
                      rows="3"
                      placeholder="Add a comment..."
                    ></textarea>
                    <button
                      onClick={() => submitComment(announcement.id)}
                      className="btn btn-primary mt-2"
                    >
                      Submit Comment
                    </button>
                  </div>
                  {comments.filter(
                    (comment) => comment.announcement === announcement.id
                  ).length > 0 ? (
                    <ul className="list-group">
                      {comments
                        .filter(
                          (comment) => comment.announcement === announcement.id
                        )
                        .map((comment) => (
                          <li
                            key={comment.id}
                            className="list-group-item comment-item"
                          >
                            <strong>{comment.user_full_name}: </strong>
                            <p>{comment.content}</p>
                            <span className="text-muted">
                              {new Date(comment.date).toLocaleString()}
                            </span>
                            <FaRegComment className="comment-icon" />
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <span className="text-muted">No comments yet</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mb-0">
            {path !== 'profile' ? (
              <span>
                There are no Announcements in this Course. Consider adding one
                to start the chat!
              </span>
            ) : (
              <span>
                This user has not posted an announcement yet. Users can only
                post announcements in courses.
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

export default Announcements
