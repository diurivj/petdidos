import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { cn } from '~/lib/utils'

type ComboboxProps = {
  open: boolean
  setOpen: (value: boolean) => void
  value: string
  setValue: (value: string) => void
  options: { label: string; value: string }[]
}

export function Combobox({
  open,
  options,
  value,
  setValue,
  setOpen
}: ComboboxProps) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className='w-full justify-between px-3'
        >
          {value ? value : 'Escoge una raza'}
          <ChevronsUpDown className='opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='z-20 w-full p-0'>
        <Command>
          <CommandInput placeholder='Buscar raza...' className='h-9' />
          <CommandList>
            <CommandEmpty>No hay razas con este criterio</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={currentValue => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
