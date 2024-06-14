// BlogView.jsx

import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"

const BlogView = () => {
  const { id } = useParams()
  const [blog, setBlog] = useState(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`/api/blogs/${id}`)
        setBlog(response.data)
      } catch (error) {
        console.error("Error fetching blog:", error)
      }
    }

    fetchBlog()
  }, [id])

  if (!blog) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>{blog.title}</h2>
      <p>Author: {blog.author}</p>
      <p>Likes: {blog.likes}</p>
      <p>{blog.content}</p>
    </div>
  )
}

export default BlogView
