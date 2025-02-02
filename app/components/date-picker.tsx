import { cn } from '~/lib/utils'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from './ui/calendar'

export function DatePicker() {
  const [date, setDate] = useState<undefined | Date>()

  return (
    <>
      <input
        id='pet-last-location-date'
        name='pet-last-location-date'
        className='hidden text-sm'
        type='date'
        value={date?.toISOString().split('T')[0]}
        required
        readOnly
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon />
            {date ? (
              new Date(date).toLocaleDateString('es-MX', { dateStyle: 'long' })
            ) : (
              <span>Escoge una fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </>
  )
}
