"use client"

import { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import 'react-day-picker/dist/style.css'

// Add custom CSS to override default styles if needed
const customStyles = `
  .rdp {
    --rdp-accent-color: #e11d48;
    --rdp-accent-background-color: #e11d48;
    --rdp-selected-color: white;
  }
  .rdp-month {
    background: white;
  }
  .rdp-months {
    background: white;
  }
  .rdp-day {
    background: white;
  }
  .rdp-day_outside {
    background: #f9fafb;
    color: #9ca3af;
  }
  .rdp-head_cell {
    background: white;
  }
`

interface DateRangePickerProps {
  value: { start: Date | undefined; end: Date | undefined }
  onChange: (range: { start: Date | undefined; end: Date | undefined }) => void
  listingId?: string
}

export default function DateRangePicker({ value, onChange, listingId }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [bookedDates, setBookedDates] = useState<{ start: Date; end: Date }[]>([])

  // Get today's date for min date selection
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Fetch availability data when listingId changes or calendar opens
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!listingId || !isOpen) return

      setLoadingAvailability(true)
      try {
        const response = await fetch(`/api/listings/${listingId}/availability`)
        if (response.ok) {
          const data = await response.json()
          setBookedDates(data.bookedDates || [])
        }
      } catch (error) {
        console.error('Error fetching availability:', error)
      } finally {
        setLoadingAvailability(false)
      }
    }

    fetchAvailability()
  }, [listingId, isOpen])

  // Handle date selection
  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      onChange({ start: undefined, end: undefined })
      return
    }

    const start = range.from
    const end = range.to

    // Disallow past start
    if (start && start < today) {
      onChange({ start: undefined, end: undefined })
      return
    }

    // First click -> only start, keep open
    if (start && !end) {
      onChange({ start, end: undefined })
      return
    }

    // Second click -> both set, then close
    if (start && end) {
      const validEnd = end > start ? end : new Date(start.getTime() + 24*60*60*1000)
      onChange({ start, end: validEnd })
      setIsOpen(false)
      return
    }

    onChange({ start: undefined, end: undefined })
  }

  const selected = value.start ? { from: value.start, to: value.end } : undefined

  // Check if a date is within any booked range
  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedRange => {
      const start = new Date(bookedRange.start)
      const end = new Date(bookedRange.end)
      return date >= start && date <= end
    })
  }

  const disabledDays = [
    { before: today },
    // Disable dates that are already booked
    ...(bookedDates.map(range => ({
      from: new Date(range.start),
      to: new Date(range.end)
    })) || [])
  ]

  const displayText = value.start && value.end
    ? `${format(value.start, 'MMM dd, yyyy')} - ${format(value.end, 'MMM dd, yyyy')}`
    : 'Select rental dates'

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal h-auto p-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span className="truncate">
          {displayText}
        </span>
        {loadingAvailability && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border">
          <CardContent className="p-0">
            <style>{customStyles}</style>
            <DayPicker
              mode="range"
              selected={selected}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={disabledDays}
              modifiers={{
                today: today,
                disabled: (date) => date < today || isDateBooked(date),
                booked: (date) => isDateBooked(date)
              }}
              modifiersStyles={{
                today: {
                  fontWeight: 'bold',
                  border: '2px solid #e11d48',
                  color: '#e11d48',
                  backgroundColor: 'white'
                },
                disabled: {
                  color: '#d1d5db',
                  textDecoration: 'line-through',
                  backgroundColor: 'white'
                },
                selected: {
                  backgroundColor: '#e11d48',
                  color: 'white',
                  fontWeight: 'bold'
                },
                range_start: {
                  backgroundColor: '#e11d48',
                  color: 'white',
                  fontWeight: 'bold',
                  borderTopLeftRadius: '0.375rem',
                  borderBottomLeftRadius: '0.375rem'
                },
                range_end: {
                  backgroundColor: '#e11d48',
                  color: 'white',
                  fontWeight: 'bold',
                  borderTopRightRadius: '0.375rem',
                  borderBottomRightRadius: '0.375rem'
                },
                range_middle: {
                  backgroundColor: '#fecaca',
                  color: '#991b1b'
                },
                outside: {
                  backgroundColor: '#f9fafb',
                  color: '#9ca3af'
                },
                booked: {
                  backgroundColor: '#ef4444',
                  color: 'white',
                  textDecoration: 'line-through',
                  cursor: 'not-allowed'
                }
              }}
              className="rdp"
              onMonthChange={setCurrentMonth}
            />
          </CardContent>
        </Card>
      )}

      {/* Close when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
