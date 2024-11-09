import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { IconSpinner } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'

export function AllNewRules({ fetchData }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const handleFileChange = e => {
    setSelectedFile([...e.target.files])
  }
  const [file, setFile] = useState()
  const handleDivClick = () => {
    fileInputRef.current.click()
  }
  const deleteAllRules = async () => {
    setLoading(true)
    setLoadingMessage('Delete Old Rules')

    try {
      const token = localStorage.getItem('token') // Get the token from localStorage

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/delete_all_rules`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `token ${token}` // Add the Authorization header with the token

            // Include other necessary headers, such as authorization tokens
          }
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rule threshold')
      }
      handleFileUpload()
    } catch (error) {
      console.error('Error updating threshold:', error.message)
    }
  }
  const handleFileUpload = async event => {
    setLoadingMessage('Creating New Rules') // Start loading indicator

    const formData = new FormData()

    for (const file of selectedFile) {
      formData.append('file', file)
    }

    try {
      const token = localStorage.getItem('token') // Get the token from localStorage

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/rules`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${token}` // Add the Authorization header with the token
          },
          body: formData
        }
      )

      if (response.ok) {
        console.log('File uploaded successfully')
        fetchData()
        setModalOpen(false)
        // Handle successful upload here
      } else {
        throw new Error('Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setLoading(false) // Stop loading indicator
    }
  }
  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button onClick={e => setModalOpen(true)} variant="outline">
          Create New Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Rules</DialogTitle>
          <DialogDescription>
            Upload Files to Create New Rules.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
            accept=".pdf, .doc, .docx"
          />

          <Button onClick={handleDivClick} variant="outline">
            <Upload className="h-4 w-4 mr-1" />
            Click here to upload files
          </Button>

          {selectedFile != null && (
            <div>
              {selectedFile?.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="text-black mb-3 flex flex-row justify-between rounded-md border p-3 dark:bg-gray-800 dark:text-white md:p-[14px]"
                  >
                    <p className="text-[13px]">{item?.name}</p>
                    <div className="flex flex-row"></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => deleteAllRules()}>
            {loading ? (
              <div className="flex items-center">
                {' '}
                <IconSpinner className="h-4 w-4 mr-1" /> {loadingMessage}
              </div>
            ) : (
              'Create New Rules'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
