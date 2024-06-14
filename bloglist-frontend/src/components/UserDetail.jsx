// UserDetail.jsx

import React, { useState, useEffect } from "react"
import axios from "axios"

const UserDetail = ({ userId }) => {
  const [user, setUser] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(`/api/users/${userId}`)
        setUser(userResponse.data)
        const blogResponse = await axios.get(`/api/users/${userId}/blogs`)
        setBlogs(blogResponse.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [userId])

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <h3>Blogs Added by {user.name}:</h3>
      <ul>
        {blogs.map((blog) => (
          <li key={blog.id}>{blog.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default UserDetail
