import { Separator } from '@/components/ui/separator'
import { UIState } from '@/lib/chat/actions'
import { Session } from '@/lib/types'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { ChatMessage } from './chat-message'

export interface ChatList {
  messages: UIState
  session?: Session
  isShared: boolean
}

export function ChatList({
  messages,
  session,
  isShared,
  currentStep,
  error
}: ChatList) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={message.id}>
          <ChatMessage
            currentStep={message?.stepState?.currentStep}
            error={message?.stepState?.error}
            message={message}
          />
          {index < messages.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  )
}
