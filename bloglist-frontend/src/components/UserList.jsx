import React from "react"
import axios from "axios"
import { useQuery } from "react-query"

const fetchUsers = async () => {
  const response = await axios.get("/api/users")
  return response.data
}

const UserList = ({ handleUserClick }) => {
  const { data: users, error, isLoading } = useQuery("users", fetchUsers)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error fetching users</div>

  return (
    <div>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Blogs Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} onClick={() => handleUserClick(user.id)}>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.blogs ? user.blogs.length : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserList
