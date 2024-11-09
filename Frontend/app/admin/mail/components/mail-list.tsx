'use client'

import { ComponentProps } from 'react'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Mail } from '../data'
import { useMail } from '../use-mail'
import { Flag, FlagTriangleRight } from 'lucide-react'

interface MailListProps {
  items: Mail[]
  handleSelectUser?: Function
}

export function MailList({
  items,
  handleSelectUser,
  selectedUser
}: MailListProps) {
  const [mail, setMail] = useMail()
  console.log(items)
  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items?.map(item => (
          <button
            key={item.id}
            className={cn(
              'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
              selectedUser == item && 'bg-muted'
            )}
            onClick={() => handleSelectUser(item)}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center justify-between w-full  gap-2">
                  <div className="font-semibold">{item}</div>
                  {item == 'adityapal' && (
                    <div className="flex w-full justify-end">
                      <FlagTriangleRight
                        size={20}
                        color="#b81919"
                        strokeWidth={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>['variant'] {
  if (['work'].includes(label.toLowerCase())) {
    return 'default'
  }

  if (['personal'].includes(label.toLowerCase())) {
    return 'outline'
  }

  return 'secondary'
}
