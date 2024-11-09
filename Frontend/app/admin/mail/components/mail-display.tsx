import addDays from 'date-fns/addDays'
import addHours from 'date-fns/addHours'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

import format from 'date-fns/format'
import nextSaturday from 'date-fns/nextSaturday'
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2
} from 'lucide-react'

import {
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'

import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Mail } from '../data'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface MailDisplayProps {
  mail: Mail | null
}
function extractRuleAndDescription(input) {
  // Regex to match 'rule' and 'description' fields
  const regex = /'rule':\s*(\d+),\s*'description'\s*:\s*(['"])(.*?)(?<!\\)\2/
  const match = input.match(regex)

  if (match && match[1] && match[3]) {
    // Construct the desired output format
    return `<strong>Rule ${match[1]} violated:</strong> ${match[3]}`
  } else {
    return 'No valid data found or improper format.'
  }
}

export function MailDisplay({ mail }: MailDisplayProps) {
  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {mail
          .sort((a, b) => new Date(b.create_at) - new Date(a.create_at))
          .map((item, index) => (
            <button
              key={`parent-${item.query}+${index}`}
              className={cn(
                'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent'
              )}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <Badge
                      key={item.category}
                      variant={
                        item.category == 'Safe' ? 'success' : 'destructive'
                      }
                    >
                      {item.category == 'Safe'
                        ? item.type
                        : `Unsafe - ${item.type} `}
                    </Badge>
                  </div>
                  <div className={cn('ml-auto text-xs')}>
                    {formatDistanceToNow(new Date(item.create_at), {
                      addSuffix: true
                    })}
                  </div>
                </div>
                <div className="text-xs font-medium">{item.query}</div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {item.type == 'Query Classification' ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: extractRuleAndDescription(item.description)
                    }}
                  />
                ) : (
                  item.description
                )}
              </div>
              {/* {item.labels.length ? (
            <div className="flex items-center gap-2">
              {item.labels.map(label => (
                <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                  {label}
                </Badge>
              ))}
            </div>
          ) : null} */}
            </button>
          ))}
      </div>
    </ScrollArea>
  )
}
