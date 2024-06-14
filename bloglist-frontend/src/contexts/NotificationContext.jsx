// NotificationContext.js
import React, { createContext, useReducer, useContext } from "react"

const initialState = {
  message: null,
  className: "",
}

const NotificationContext = createContext()

export const useNotification = () => {
  return useContext(NotificationContext)
}

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SHOW_NOTIFICATION":
      return {
        message: action.payload.message,
        className: action.payload.className,
      }
    case "HIDE_NOTIFICATION":
      return initialState
    default:
      return state
  }
}

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
    </NotificationContext.Provider>
  )
}
