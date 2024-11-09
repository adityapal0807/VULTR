import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import { Dropdown } from 'primereact/dropdown'
import { useEffect, useState } from 'react'
import { MultiSelect } from './ui/MultiSelect'

const exampleMessages = [
  {
    heading: 'Explain technical concepts',
    message: `What is a "serverless function"?`
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article for a 2nd grader: \n'
  },
  {
    heading: 'Draft an email',
    message: `Draft an email to my boss about the following: \n`
  }
]

export function EmptyScreen({ selected, setSelected }) {
  function simplifyData(collections) {
    return collections.map(collection => ({
      value: collection,
      label: collection
    }))
  }
  async function fetchData() {
    const token = localStorage.getItem('userToken') // Get the token from localStorage

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
        const simplifiedData = simplifyData(jsonData?.collections)

        setOptions(simplifiedData)
      } else {
        throw new Error('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
    }
  }

  // Example usage

  const [options, setOptions] = useState([])
  const [collections, setCollections] = useState([])
  const [selectedCollections, setSelectedCollections] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Welcome to Decasafe AI Chatbot!
        </h1>
        <MultiSelect
          options={options}
          selected={selected}
          onChange={setSelected}
          className="w-[560px]"
        />
      </div>
    </div>
  )
}
