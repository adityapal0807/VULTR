'use client'
import { Badge } from '@/components/ui/badge'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconSpinner } from '@/components/ui/icons'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
const categoryColors = {
  educational: 'bg-yellow-300', // Yellow for educational
  financial: 'bg-red-300', // Red for financial
  human_resource: 'bg-blue-300', // Blue for human resource
  literary: 'bg-green-300', // Green for literary
  personal: 'bg-purple-300' // Purple for personal
}
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({ collections: [], categories: [] })

  async function fetchData() {
    const token = localStorage.getItem('userToken') // Get the token from localStorage

    setIsLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/get_all_collections`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${token}` // Add the Authorization header with the token
          }
        }
      )
      if (response.ok) {
        const jsonData = await response.json()
        setData(jsonData)
      } else {
        throw new Error('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const handleFileUpload = async event => {
    const file = event.target.files[0]
    if (!file) return

    setIsLoading(true) // Start loading indicator

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/new_file_upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (response.ok) {
        console.log('File uploaded successfully')
        fetchData()
        // Handle successful upload here
      } else {
        throw new Error('Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsLoading(false) // Stop loading indicator
    }
  }
  useEffect(() => {
    fetchData()
  }, [])
  return (
    <div className="flex  w-full flex-col bg-muted/40 overflow-auto">
      <div className="flex flex-col sm:gap-4 sm:py-4 ">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 justify-between">
          <h2 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
            Files Manager
          </h2>
          <input
            type="file"
            style={{ display: 'none' }}
            id="file-upload"
            onChange={handleFileUpload}
          />
          <Button
            onClick={() => {
              document.getElementById('file-upload').click()
            }}
          >
            {isLoading ? <IconSpinner /> : 'Upload New Files'}
          </Button>
        </header>
        <main className=" flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 ">
          <Card x-chunk="dashboard-05-chunk-3" className="min-h-[80vh]">
            <CardHeader className="px-7">
              <CardTitle>List of Files</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>

                    <TableHead>Collection</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Uploaded On</TableHead>

                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.collections.map((collection, index) => (
                    <TableRow key={index}>
                      <TableCell className="p-4">{index + 1}</TableCell>

                      <TableCell className="p-4">{collection}</TableCell>
                      <TableCell className="p-4">
                        <span
                          className={
                            data.categories.length > 0 && data.categories[index]
                              ? `${categoryColors[data?.categories[index]?.category?.toLowerCase()?.replace(/\s+/g, '_')]} p-2 rounded-md `
                              : 'bg-gray-200'
                          }
                        >
                          {' '}
                          {data.categories.length > 0 && data.categories[index]
                            ? `${data?.categories[index]?.category}`
                            : 'No category info'}
                        </span>
                      </TableCell>
                      <TableCell className="p-4">15-04-2024 </TableCell>

                      <TableCell className="py-4">
                        <Button
                          className="!py-0  flex items-center gap-1"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
