'use client'
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo
} from 'react'

const defaultContext = {
  messages: [],
  setMessages: () => {}
}

const ChatContext = createContext(defaultContext)

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const value = useMemo(
    () => ({ messages, setMessages }),
    [messages, setMessages]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)
