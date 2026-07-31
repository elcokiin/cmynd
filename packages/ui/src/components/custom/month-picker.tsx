"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "../button"
import { Calendar } from "../calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"

interface MonthPickerProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

function parseMonthString(value?: string): Date | undefined {
  if (!value) return undefined
  const parts = value.split("-")
  if (parts.length !== 2) return undefined
  const year = Number(parts[0])
  const month = Number(parts[1])
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return undefined
  return new Date(year, month - 1, 1)
}

function toMonthString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function MonthPicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a month",
  className,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false)
  const date = parseMonthString(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            data-empty={!date}
            disabled={disabled}
            className={cn(
              "justify-start text-left font-normal",
              "data-[empty=true]:text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        {date ? format(date, "MMM yyyy") : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          startMonth={new Date(2000, 0)}
          endMonth={new Date(2040, 11)}
          onSelect={(selected) => {
            if (selected) {
              onChange?.(toMonthString(selected))
            }
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { MonthPicker }
