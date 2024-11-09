import * as React from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from './ui/label'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Save, Trash2 } from 'lucide-react'
import { debounce } from 'lodash' // You might need to install lodash.debounce
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

interface RuleThresholdSelectorProps {
  defaultValue: number
  ruleDescription: string
}

export function NewRule({
  length,addRule
 
}: RuleThresholdSelectorProps) {
  const saveNewRule = async () => {
    const formData = new FormData();
    formData.append('rule_number', length+1);
    formData.append('rule_description', textAreaValue);
    formData.append('rule_threshold',value[0] );
  
    try {
      const token = localStorage.getItem('token') // Get the token from localStorage

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/add_rule`,
        {
          method: 'POST',
          headers: {
          
            Authorization: `token ${token}` // Add the Authorization header with the token

            // Include other necessary headers, such as authorization tokens
          },
          body: formData // Set the body of the request to the FormData instance
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rule threshold')
      }
      addRule()
      setTextAreaValue('')
      setValue([10])
    } catch (error) {
      console.error('Error updating threshold:', error.message)
    }
  }
  const [value, setValue] = React.useState([10])
  const [textAreaValue, setTextAreaValue] = React.useState("")

  // Call API when value changes
//   React.useEffect(() => {
//     console.log(value, defaultValue)
//     if (value[0] !== defaultValue) {
//       // Prevent calling on initial render
//       debouncedUpdateThreshold(value)
//     }
//   }, [value, debouncedUpdateThreshold, defaultValue])
  return (
    <div
      key={`parent-`}
      className={cn(
        'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all bg-accent'
      )}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <Badge key={'New Rule'}>Rule No {length + 1}</Badge>
          </div>
          <div className={cn('ml-auto text-xs')}>
            {' '}
            <Button onClick={()=>saveNewRule()} className="!p-0 flex items-center gap-1" variant="ghost">
              <Save className="h-4 w-4" />
             
            </Button>
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground w-full">
        {/* <Label htmlFor={`rule-slider-new`}>{ruleDescription}</Label> */}
        <Textarea value={textAreaValue} onChange={(e)=>{setTextAreaValue(e.target.value)}}/>
      </div>
      <span className=" w-full rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
        {value}
      </span>
      <Slider
        id={`rule-slider-new`}
        max={10}
        defaultValue={value}
        step={1}
        onValueChange={setValue}
        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
        aria-label="Rule Threshold"
      />
    </div>
  )
}
