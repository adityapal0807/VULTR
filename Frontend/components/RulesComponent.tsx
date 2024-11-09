import * as React from 'react'
import { RuleThresholdSelector } from './RuleThresholdSelector'
import { NewRule } from './NewRule'
import { AllNewRules } from '@/app/admin/_components/AllNewRules'

const RulesComponent = () => {
  const [rulesData, setRulesData] = React.useState([])
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token') // Get the token from localStorage
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEW_API_URL_CINCO}/api/rules`,
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
      setRulesData(data)
    } catch (error) {
      console.error('Fetch error:', error)
    }
  }
  React.useEffect(() => {
    fetchData()
  }, [])
  return (
    <>
      <div className="absolute right-[25px] top-[18px]">
        <AllNewRules fetchData={fetchData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {rulesData?.rules?.map((rule, index) => (
          <RuleThresholdSelector
            key={rule.id} // Use unique identifier for key
            defaultValue={rule.rule_threshold}
            index={index}
            deleteRule={fetchData}
            ruleDescription={rule.rule_description}
          />
        ))}
        <NewRule length={rulesData?.rules?.length} addRule={fetchData} />
      </div>
    </>
  )
}

export default RulesComponent
