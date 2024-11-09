'use client'
import React from 'react'
import { CheckCircle, Loader } from 'lucide-react'
import { Progress } from '@radix-ui/react-progress'
import { Separator } from '@/components/ui/separator'

const Stepper = ({ currentStep, error }) => {
  const steps = ['Query Check ', 'Injection check', 'Anonymising PII']

  return (
    <ul className="relative flex flex-row w-[108%] ">
      {steps.map((step, index) => {
        let statusIcon
        let horizontalLine
        if (error == index) {
          statusIcon = (
            <span className="size-7 flex justify-center items-center shrink-0 bg-red-500 font-medium text-white rounded-full group-focus:bg-gray-200 hs-stepper-active:bg-blue-600 hs-stepper-active:text-white hs-stepper-success:bg-blue-600 hs-stepper-success:text-white hs-stepper-completed:bg-teal-500 hs-stepper-completed:group-focus:bg-teal-600">
              <svg
                className=" flex-shrink-0 size-3 block"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </span>
          )
          horizontalLine = <hr className="h-px w-[72px] border border-black" />
        } else if (index < currentStep) {
          statusIcon = (
            <span className="size-7 flex justify-center items-center shrink-0 bg-success-600 font-medium text-white rounded-full group-focus:bg-gray-200 hs-stepper-active:bg-blue-600 hs-stepper-active:text-white hs-stepper-success:bg-blue-600 hs-stepper-success:text-white hs-stepper-completed:bg-teal-500 hs-stepper-completed:group-focus:bg-teal-600">
              <svg
                className="block shrink-0 size-3 hs-stepper-success:block"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          )
          horizontalLine = (
            <hr className="h-px w-[72px] border border-success-600" />
          )
        } else if (index === currentStep) {
          statusIcon = (
            <span className="size-7 flex justify-center items-center shrink-0 bg-white font-medium text-gray-800 rounded-full group-focus:bg-gray-200 hs-stepper-active:bg-blue-600 hs-stepper-active:text-white hs-stepper-success:bg-blue-600 hs-stepper-success:text-white hs-stepper-completed:bg-teal-500 hs-stepper-completed:group-focus:bg-teal-600">
              <span
                className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-success-600 rounded-full dark:text-blue-500"
                role="status"
                aria-label="loading"
              >
                <span className="sr-only">Loading...</span>
              </span>
            </span>
          )
          horizontalLine = <hr className="h-px w-[72px] border border-black" />
        } else {
          statusIcon = (
            <span className="size-7 flex justify-center items-center shrink-0 bg-gray-100 font-medium text-gray-800 rounded-full group-focus:bg-gray-200 hs-stepper-active:bg-blue-600 hs-stepper-active:text-white hs-stepper-success:bg-blue-600 hs-stepper-success:text-white hs-stepper-completed:bg-teal-500 hs-stepper-completed:group-focus:bg-teal-600">
              <span className="hs-stepper-success:hidden hs-stepper-completed:hidden">
                {index + 1}
              </span>
            </span>
          )
          horizontalLine = <hr className="h-px w-[72px] border border-black" />
        }

        return (
          <div
            key={index}
            className="flex items-center gap-x-2 shrink basis-0 flex-1 group success"
          >
            <div className="min-w-7 min-h-7 group inline-flex items-center text-xs align-middle">
              {' '}
              {statusIcon}
            </div>
            <span className="ms-2 text-sm font-medium text-gray-800">
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className="py-2.5 ">{horizontalLine}</div>
            )}
          </div>
        )
      })}
    </ul>
  )
}

export default Stepper
