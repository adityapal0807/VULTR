'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { Message } from '@/lib/chat/actions'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { useChat } from './ChatProvider'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const token = localStorage.getItem('userToken') // Get the token from localStorage

  const [input, setInput] = useState('')
  const [aiState] = useAIState()
  const [messages, setMessages] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const steps = ['Classify Query', 'Check Injection', 'Check PII']

  const handleError = (step, message, messageIndex) => {
    setMessages(prevMessages =>
      prevMessages.map((msg, index) =>
        index === messageIndex
          ? {
              ...msg,
              stepState: {
                ...msg.stepState,
                error: step
              },
              content: message
            }
          : msg
      )
    )
    setLoading(false)
  }
  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()
  const classifyQuery = async index => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/classify_query`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${token}` // Add the Authorization header with the token
          },
          body: new URLSearchParams(`query=${input}`)
        }
      )
      const data = await response.json()
      if (data.class !== 'Safe') {
        handleError(0, data.reason.description, index)

        return false
      }
      return true
    } catch (error) {
      handleError(0, error.message, index)

      return false
    }
  }

  const checkInjection = async index => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/injection`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${token}` // Add the Authorization header with the token
          },
          body: new URLSearchParams(`query=${input}`)
        }
      )
      const data = await response.json()
      if (data.result !== 'Safe') {
        handleError(1, data.result, index)

        return false
      }
      return true
    } catch (error) {
      handleError(1, error.message, index)

      return false
    }
  }
  const addMessage = content => {
    const newMessage = {
      content: '',
      stepState: {
        currentStep: 0,
        error: null
      },
      answering: true,
      role: 'assistant'
    }
    setMessages(prevMessages => [...prevMessages, newMessage])
  }

  const updateMessageStepState = (messageIndex, stepState) => {
    setMessages(prevMessages =>
      prevMessages.map((msg, index) =>
        index === messageIndex ? { ...msg, stepState } : msg
      )
    )
  }

  const checkPII = async messageIndex => {
    console.log(selected, 'selected')
    const collections = selected.reduce((acc, item, index) => {
      acc[`collection_name_${index + 1}`] = item.value
      return acc
    }, {})

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/check_pii`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`, // Add the Authorization header with the token
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            collections: collections,
            query: input
          })
        }
      )
      if (!response.ok) {
        throw new Error('Please Try Again Later')
        return
      }
      if (response.status === 400) {
        const errorResponse = await response.json()
        const { errorCode, errorMessage } = errorResponse

        throw new Error(errorMessage || 'Bad Request')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let chunks = ''
      let contents = {}
      let sourceData
      let centralQuestionContent = ''
      let feederId = ''
      let data = ''

      let isConversationFinished = false // Flag variable
      let shouldStoreNextDataObject = false // Flag to indicate whether to store the next data object
      let storeCentralQuestion = false
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          setMessages(prev =>
            prev.map(i => {
              const { answering, ...rest } = i
              if (answering) {
                return {
                  ...rest,
                  answering: false
                }
              }
              return i
            })
          )
          updateMessageStepState(messageIndex, { currentStep: 3, error: null })

          break
        }

        data = new TextDecoder().decode(value)

        const dataChunks = data.split('\n')
        dataChunks.forEach(chunk => {
          const data = chunk.replace(/^data: /, '')
          try {
            const jsonData = JSON.parse(data)
            if (jsonData.choices) {
              // Get content of Dave's response
              let daveResponse = jsonData.choices[0].delta.content

              // Append Dave's response to contents if it exists
              if (daveResponse) {
                chunks += daveResponse
                setMessages(prev => {
                  // Find the last index where 'answering' is true
                  const lastIndex = prev
                    .map((item, index) => ({
                      index,
                      answering: item.answering
                    }))
                    .filter(item => item.answering)
                    .map(item => item.index)
                    .pop()

                  // If no 'answering' was true, just return the array as is
                  if (lastIndex === undefined) {
                    return prev
                  }

                  // Update the content at the last 'answering' index
                  return prev.map((item, index) => {
                    if (index === lastIndex) {
                      return {
                        ...item,
                        content: chunks // Assuming 'chunks' is defined and contains the new content
                      }
                    }
                    return item
                  })
                })
              }
            }
          } catch (error) {
            console.error('Invalid JSON:', error)
          }
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  const executeStepForMessage = async messageIndex => {
    if (await classifyQuery(messageIndex)) {
      updateMessageStepState(messageIndex, { currentStep: 1, error: null })
      if (await checkInjection(messageIndex)) {
        updateMessageStepState(messageIndex, { currentStep: 2, error: null })
        if (await checkPII(messageIndex)) {
          updateMessageStepState(messageIndex, { currentStep: 3, error: null })
        }
      }
    }
  }

  const handleSendMessage = async () => {
    const newUserMessage = {
      role: 'user',
      content: input,
      answering: false // Assuming user messages are not "answering"
    }

    // Add system response message with placeholder for processing steps
    const newSystemMessage = {
      role: 'assistant',
      content: '',
      answering: true, // Indicates this message will include ongoing operations
      stepState: {
        currentStep: 0,
        error: null
      }
    }

    // Update messages state with both new messages
    setMessages(prevMessages => [
      ...prevMessages,
      newUserMessage,
      newSystemMessage
    ])

    // Execute steps for the newly added system message
    const systemMessageIndex = messages.length + 1 // +1 because we just added a user message before it
    await executeStepForMessage(systemMessageIndex)
  }

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className={cn('pb-[200px] pt-4 md:pt-10', className)}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList
            currentStep={currentStep}
            error={error}
            messages={messages}
            isShared={false}
            session={session}
          />
        ) : (
          <EmptyScreen selected={selected} setSelected={setSelected} />
        )}
        <div className="h-px w-full" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        messages={messages}
        setMessages={setMessages}
        executeSteps={handleSendMessage}
      />
    </div>
  )
}
