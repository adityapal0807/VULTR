'use client'

import * as React from 'react'
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
  X
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useMail } from '../use-mail'
import { Mail } from '../data'
import { Nav } from './nav'
import { AccountSwitcher } from './account-switcher'
import { MailList } from './mail-list'
import { MailDisplay } from './mail-display'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import { ScrollArea } from '@/components/ui/scroll-area'

interface MailProps {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  mails: Mail[]
  defaultLayout?: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
}

export function Mail({
  mails,
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false
}: MailProps) {
  console.log(mails, 'mails')
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail] = useMail()
  const [users, setUsers] = React.useState()
  const [selectedUser, setSelectedUser] = React.useState()
  const [userQueries, setUserQueries] = React.useState([])
  const token = localStorage.getItem('token') // Get the token from localStorage

  // Update user queries when selected user changes
  React.useEffect(() => {
    if (selectedUser) {
      setUserQueries(mails[selectedUser])
    }
  }, [selectedUser])

  React.useEffect(() => {
    setUsers(Object.keys(mails))
    setSelectedUser(Object.keys(mails)[0] || null)
  }, [mails])

  // Handle selecting a new user
  const handleSelectUser = user => {
    setSelectedUser(user)
  }
  const [summary, setSummary] = React.useState('')
  const checkPII = async () => {
    const formData = new FormData() // Create a new FormData instance
    formData.append('username', 'adityapal') // Append the username to the form data

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/summary`,
        {
          method: 'POST', // Set the method to POST
          headers: {
            Authorization: `token ${token}` // Add the Authorization header with the token
          },
          body: formData // Set the body of the request to the FormData instance
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
                setSummary(chunks)
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

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-full max-h-[800px] items-stretch"
      >
        <ResizablePanel defaultSize={defaultLayout[0]} minSize={30}>
          <div className="flex items-center px-4 py-2">
            <h1 className="text-xl font-bold">User</h1>
          </div>

          <MailList
            items={users}
            handleSelectUser={handleSelectUser}
            selectedUser={selectedUser}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold w-full">User Queries</h1>
              <div className="w-full justify-end flex">
                <Button
                  className="mr-2"
                  size={'sm'}
                  onClick={() => {
                    checkPII()
                  }}
                >
                  Summarize{' '}
                </Button>
                {summary && (
                  <Button className="mr-2" variant={'secondary'} size={'sm'}>
                    Download Report{' '}
                  </Button>
                )}
              </div>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All Queries
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unsafe
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              {summary && (
                <ScrollArea className="h-[40vh] overflow-auto">
                  <div
                    key={`parent-}`}
                    className={cn(
                      'flex  flex-col m-4 p-3 items-start gap-2 rounded-lg border  text-left text-sm transition-all hover:bg-accent'
                    )}
                  >
                    <div className="flex w-full flex-col gap-1">
                      <div className="flex items-center">
                        <div className="flex items-center gap-2">
                          <Badge>Summary</Badge>
                        </div>
                        <div className={cn('ml-auto text-xs')}>
                          <Button
                            className="!p-0 flex items-center gap-1"
                            variant="ghost"
                            onClick={() => setSummary('')}
                          >
                            <X />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs ">
                      <span>
                        <MemoizedReactMarkdown
                          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                          remarkPlugins={[remarkGfm, remarkMath]}
                          components={{
                            p({ children }) {
                              return (
                                <p className="mb-2 last:mb-0">{children}</p>
                              )
                            },
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) {
                              if (children.length) {
                                if (children[0] == '▍') {
                                  return (
                                    <span className="mt-1 cursor-default animate-pulse">
                                      ▍
                                    </span>
                                  )
                                }

                                children[0] = (children[0] as string).replace(
                                  '`▍`',
                                  '▍'
                                )
                              }

                              const match = /language-(\w+)/.exec(
                                className || ''
                              )

                              if (inline) {
                                return (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                )
                              }

                              return (
                                <CodeBlock
                                  key={Math.random()}
                                  language={(match && match[1]) || ''}
                                  value={String(children).replace(/\n$/, '')}
                                  {...props}
                                />
                              )
                            }
                          }}
                        >
                          {summary}
                        </MemoizedReactMarkdown>
                      </span>
                    </div>
                  </div>
                </ScrollArea>
              )}
              <MailDisplay mail={userQueries} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              {summary && (
                <ScrollArea className="h-[40vh] overflow-auto">
                  <div
                    key={`parent-}`}
                    className={cn(
                      'flex  flex-col m-4 p-3 items-start gap-2 rounded-lg border  text-left text-sm transition-all hover:bg-accent'
                    )}
                  >
                    <div className="flex w-full flex-col gap-1">
                      <div className="flex items-center">
                        <div className="flex items-center gap-2">
                          <Badge>Summary</Badge>
                        </div>
                        <div className={cn('ml-auto text-xs')}>
                          <Button
                            className="!p-0 flex items-center gap-1"
                            variant="ghost"
                            onClick={() => setSummary('')}
                          >
                            <X />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs ">
                      <span>
                        <MemoizedReactMarkdown
                          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                          remarkPlugins={[remarkGfm, remarkMath]}
                          components={{
                            p({ children }) {
                              return (
                                <p className="mb-2 last:mb-0">{children}</p>
                              )
                            },
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) {
                              if (children.length) {
                                if (children[0] == '▍') {
                                  return (
                                    <span className="mt-1 cursor-default animate-pulse">
                                      ▍
                                    </span>
                                  )
                                }

                                children[0] = (children[0] as string).replace(
                                  '`▍`',
                                  '▍'
                                )
                              }

                              const match = /language-(\w+)/.exec(
                                className || ''
                              )

                              if (inline) {
                                return (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                )
                              }

                              return (
                                <CodeBlock
                                  key={Math.random()}
                                  language={(match && match[1]) || ''}
                                  value={String(children).replace(/\n$/, '')}
                                  {...props}
                                />
                              )
                            }
                          }}
                        >
                          {summary}
                        </MemoizedReactMarkdown>
                      </span>
                    </div>
                  </div>
                </ScrollArea>
              )}
              <MailDisplay
                mail={userQueries.filter(item => item.type != 'Safe')}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
