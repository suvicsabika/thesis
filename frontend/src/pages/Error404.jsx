import React from 'react'

import { Link } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'

const Error404 = () => {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="lead">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/home" className="btn btn-primary mt-3">
        Go Back Home
      </Link>
    </div>
  )
}

export default Error404
