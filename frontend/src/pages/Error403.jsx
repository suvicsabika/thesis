import React from 'react'

import { Link } from 'react-router-dom'

const Error403 = () => {
  return (
    <div className="container text-center mt-5">
      <h1>403 - Forbidden</h1>
      <p>You do not have permission to access this page.</p>
      <Link to="/home" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  )
}

export default Error403
