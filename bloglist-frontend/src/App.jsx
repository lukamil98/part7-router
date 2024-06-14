// Import necessary dependencies and components
import React, { useState, useEffect, useRef } from "react"
import { BrowserRouter as Router, Route } from "react-router-dom"
import axios from "axios"
import { QueryClient, QueryClientProvider } from "react-query"
import Blog from "./components/Blog"
import Notification from "./components/Notification"
import Footer from "./components/Footer"
import blogService from "./services/blogs"
import loginService from "./services/login"
import Togglable from "./components/Togglable"
import BlogForm from "./components/BlogForm"
import UserCreationForm from "./components/UserCreationForm"
import { NotificationProvider } from "./contexts/NotificationContext"
import UserList from "./components/UserList"
import UserDetail from "./components/UserDetail" // Import the UserDetail component
import ".././styles.css"

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newBlog, setNewBlog] = useState({
    title: "",
    author: "",
    url: "",
    likes: 0,
  })
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState(null)
  const [view, setView] = useState("blogs")
  const [selectedUserId, setSelectedUserId] = useState(null) // State to store the selected user's ID
  const blogFormRef = useRef()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogappUser")
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    blogService.getAll().then((initialBlogs) => {
      initialBlogs.sort((a, b) => b.likes - a.likes)
      setBlogs(initialBlogs)
    })
  }, [])

  // Function to handle navigation to user detail view
  const handleUserClick = (userId) => {
    setSelectedUserId(userId)
    setView("userDetail")
  }

  // Function to handle adding a new blog
  const addBlog = async (event) => {
    event.preventDefault()

    try {
      const newBlogWithLikesAsNumber = {
        ...newBlog,
        likes: parseInt(newBlog.likes),
      }
      const returnedBlog = await blogService.create(newBlogWithLikesAsNumber)
      setBlogs([...blogs, returnedBlog])
      setNewBlog({
        title: "",
        author: "",
        url: "",
        likes: 0,
      })
      setSuccessMessage(
        `Blog "${returnedBlog.title}" added successfully by ${returnedBlog.author}`
      )
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      blogFormRef.current.toggleVisibility()
    } catch (exception) {
      console.error("Adding blog failed:", exception)
      setErrorMessage("Failed to add blog")
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  // Function to handle change in blog input fields
  const handleBlogChange = (event) => {
    const { name, value } = event.target
    setNewBlog({ ...newBlog, [name]: value })
  }

  // Function to handle user login
  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password,
      })
      window.localStorage.setItem("loggedBlogappUser", JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername("")
      setPassword("")
      console.log(user)
    } catch (exception) {
      console.error("Login failed:", exception)
      setErrorMessage("Wrong credentials")
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  // Function to handle user logout
  const handleLogout = () => {
    window.localStorage.removeItem("loggedBlogappUser")
    setUser(null)
  }

  // Function to toggle blog importance
  const toggleImportance = async (id) => {
    try {
      const blogToToggle = blogs.find((blog) => blog.id === id)
      const updatedBlog = {
        ...blogToToggle,
        action: "toggleImportance",
      }

      const returnedBlog = await blogService.update(id, updatedBlog)
      setBlogs(blogs.map((blog) => (blog.id !== id ? blog : returnedBlog)))
    } catch (exception) {
      console.error("Toggling importance failed:", exception)
      setErrorMessage("Failed to toggle importance")
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  // Function to create a new user
  const createUser = async (username, password) => {
    try {
      const response = await axios.post("/api/users", { username, password })
      console.log("User created successfully:", response.data)
    } catch (error) {
      console.error("Error creating user:", error.response.data.error)
    }
  }

  // Function to handle liking a blog
  const likeBlog = async (id) => {
    try {
      const blogToLike = blogs.find((blog) => blog.id === id)
      const updatedBlog = {
        ...blogToLike,
        action: "like",
        likes: parseInt(blogToLike.likes) + 1,
      }

      const returnedBlog = await blogService.update(id, updatedBlog)
      setBlogs(blogs.map((blog) => (blog.id !== id ? blog : returnedBlog)))
    } catch (exception) {
      console.error("Liking blog failed:", exception)
      setErrorMessage("Failed to like blog")
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  // Function to delete a blog
  const deleteBlog = async (id) => {
    try {
      await blogService.remove(id)
      setBlogs(blogs.filter((blog) => blog.id !== id))
      setSuccessMessage("Blog deleted successfully")
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } catch (exception) {
      console.error("Deleting blog failed:", exception)
      setErrorMessage("Failed to delete blog")
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  // Login form component
  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  // Render the main application
  return (
    <QueryClientProvider client={new QueryClient()}>
      <NotificationProvider>
        <div>
          <h1>Blogs</h1>
          <Notification message={errorMessage} />
          <Notification message={successMessage} className="success" />

          {user === null ? (
            <>
              {loginForm()}
              <UserCreationForm createUser={createUser} />
            </>
          ) : (
            <div>
              <p>
                {user.username} logged-in{" "}
                <button onClick={handleLogout}>logout</button>
              </p>
              <Togglable buttonLabel="Create new blog" ref={blogFormRef}>
                <BlogForm
                  addBlog={addBlog}
                  newBlog={newBlog}
                  handleBlogChange={handleBlogChange}
                />
              </Togglable>
            </div>
          )}

          {user && (
            <div>
              <div>
                <button onClick={() => setShowAll(!showAll)}>
                  Show {showAll ? "important" : "all"} blogs
                </button>
              </div>
              <div>
                <button onClick={() => setView("blogs")}>Blogs</button>
                <button onClick={() => setView("users")}>Users</button>
              </div>
              {view === "blogs" ? (
                <ul>
                  {blogs
                    .filter((blog) => (showAll ? true : blog.important))
                    .map((blog) => (
                      <Blog
                        key={blog.id}
                        blog={blog}
                        toggleImportance={toggleImportance}
                        likeBlog={likeBlog}
                        deleteBlog={deleteBlog}
                        user={user}
                      />
                    ))}
                </ul>
              ) : (
                <div>
                  {selectedUserId ? (
                    <UserDetail userId={selectedUserId} />
                  ) : (
                    <UserList handleUserClick={handleUserClick} />
                  )}
                </div>
              )}
            </div>
          )}
          <Footer />
        </div>
      </NotificationProvider>
    </QueryClientProvider>
  )
}

export default App
