import * as React from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from './ui/label'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'
import { debounce } from 'lodash' // You might need to install lodash.debounce

interface RuleThresholdSelectorProps {
  defaultValue: number
  ruleDescription: string
}

export function RuleThresholdSelector({
  defaultValue,
  ruleDescription,
  index,deleteRule
}: RuleThresholdSelectorProps) {
  const updateRuleThreshold = async (ruleNumber, newThreshold) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/change_rule_threshold`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // Include other necessary headers, such as authorization tokens
          },
          body: JSON.stringify({
            rule_number: ruleNumber,
            new_threshold: newThreshold[0]
          })
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rule threshold')
      }
      console.log('Threshold updated:', data.message)
    } catch (error) {
      console.error('Error updating threshold:', error.message)
    }
  }

  const deleteAddedRule = async (rule_number) => {
    const formData = new FormData();
    formData.append('rule_number', rule_number);
 
  
    try {
      const token = localStorage.getItem('token') // Get the token from localStorage

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/delete_rule`,
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
      deleteRule()
    
    } catch (error) {
      console.error('Error updating threshold:', error.message)
    }
  }
  const [value, setValue] = React.useState([defaultValue])
  const debouncedUpdateThreshold = React.useMemo(
    () =>
      debounce(newValue => {
        updateRuleThreshold(index + 1, newValue) // Assuming index + 1 corresponds to your rule number
      }, 300),
    [index]
  ) // Adjust debounce timing as needed

  // Call API when value changes
  React.useEffect(() => {
    console.log(value, defaultValue)
    if (value[0] !== defaultValue) {
      // Prevent calling on initial render
      debouncedUpdateThreshold(value)
    }
  }, [value, debouncedUpdateThreshold, defaultValue])
  return (
    <div
      key={`parent-${ruleDescription}`}
      className={cn(
        'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent'
      )}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <Badge key={ruleDescription}>Rule No {index + 1}</Badge>
          </div>
          <div className={cn('ml-auto text-xs')}>
            {' '}
            <Button onClick={()=>{deleteAddedRule(index+1)}} className="!p-0 flex items-center gap-1" variant="ghost">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        <Label htmlFor={`rule-slider-${defaultValue}`}>{ruleDescription}</Label>
      </div>
      <span className=" w-full rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
        {value}
      </span>
      <Slider
        id={`rule-slider-${defaultValue}`}
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
