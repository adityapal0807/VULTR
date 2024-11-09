'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import Stepper from './_components/Stepper'
import { Mail } from './mail/components/mail'
import { accounts, mails } from './mail/data'
import { useEffect, useState } from 'react'
import RulesComponent from '@/components/RulesComponent'

export default function Dashboard() {
  const [mails, setMails] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState({})

  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalQueries: 0,
    totalQueryClassification: 0,
    totalPromptInjection: 0
  })
  const calculateSummary = data => {
    let totalUsers = Object.keys(data).length // Total number of users
    let totalQueries = 0
    let totalQueryClassification = 0
    let totalPromptInjection = 0

    Object.values(data).forEach(queries => {
      totalQueries += queries.length // Total number of queries
      queries.forEach(query => {
        if (query.type === 'Query Classification') {
          totalQueryClassification++
        } else if (query.type === 'Prompt Injection') {
          totalPromptInjection++
        }
      })
    })

    return {
      totalUsers,
      totalQueries,
      totalQueryClassification,
      totalPromptInjection
    }
  }
  const fetchMails = async () => {
    try {
      const token = localStorage.getItem('token') // Get the token from localStorage
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/admin_panel`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${token}` // Add the Authorization header with the token
          }
        }
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      const now = new Date()
      const activityThresholdMinutes = 5
      let activityCounts = {
        TotalQueries: 0 // Initialize counter for all recent queries
      }

      // Calculate recent activity counts for each category
      Object.entries(data).forEach(([user, queries]) => {
        queries.forEach(query => {
          if (
            (now - new Date(query.create_at)) / 60000 <
            activityThresholdMinutes
          ) {
            activityCounts.TotalQueries++

            if (!activityCounts[query.type]) {
              activityCounts[query.type] = 0
            }
            activityCounts[query.type]++
          }
        })
      })
      setSummary(calculateSummary(data))
      setRecentActivity(activityCounts)
      console.log(activityCounts)

      setMails(data)
      setIsLoading(false)
    } catch (error) {
      setError('Failed to fetch data')
      setIsLoading(false)
      console.error('Fetch error:', error)
    }
  }
  useEffect(() => {
    fetchMails() // Initial fetch

    const intervalId = setInterval(fetchMails, 15000) // Fetch every 15 seconds
  }, [])

  return (
    <div className="flex  w-full flex-col bg-muted/40 overflow-auto">
      <div className="flex flex-col sm:gap-4 sm:py-4 ">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h2 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
            Dashboard
          </h2>
        </header>
        <main className=" flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 ">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Queries
                </CardTitle>
                <TooltipProvider>
                  {recentActivity.TotalQueries > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex h-4 w-4 rounded-full bg-blue-600 animate-pulse-slow" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Recent Queries: {recentActivity.TotalQueries}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.totalQueries}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unsafe Query Classified
                </CardTitle>
                <TooltipProvider>
                  {recentActivity['Query Classification'] && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex size-4 rounded-full bg-red-500 animate-pulse-danger" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Recent: {recentActivity['Query Classification']}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.totalQueryClassification}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Prompt Injected
                </CardTitle>
                {recentActivity['Prompt Injection'] && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex h-4 w-4 rounded-full bg-red-500 animate-pulse-danger" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Recent: {recentActivity['Prompt Injection']}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.totalPromptInjection}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-success-200 border-success-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Data Chunks Anonymized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isNaN(summary?.totalQueries)
                    ? 100
                    : Number(summary.totalQueries) + 100}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card x-chunk="dashboard-05-chunk-1" className="mt-4">
            <CardHeader className="pb-2">
              <Tabs defaultValue="all">
                <div className="flex items-center px-4 py-2">
                  <TabsList className="ml-1">
                    <TabsTrigger
                      value="all"
                      className="text-zinc-600 dark:text-zinc-200"
                    >
                      User Queries
                    </TabsTrigger>
                    <TabsTrigger
                      value="unread"
                      className="text-zinc-600 dark:text-zinc-200"
                    >
                      Rules
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="m-0">
                  <CardContent>
                    <Mail
                      accounts={accounts}
                      mails={mails}
                      navCollapsedSize={4}
                    />
                  </CardContent>
                </TabsContent>
                <TabsContent value="unread" className="m-0 relative">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      XYZ Organisation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RulesComponent />
                  </CardContent>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </main>
      </div>
    </div>
  )
}
