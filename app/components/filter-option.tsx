import { Label } from './ui/label'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './ui/accordion'

type FilterOptionProps = {
  id: string
  label: string
  children: React.ReactNode
}

export function FilterOption({ id, label, children }: FilterOptionProps) {
  return (
    <>
      <AccordionItem value={id} className='px-4 py-2'>
        <AccordionTrigger className='flex w-full items-center justify-between text-left hover:no-underline'>
          <Label>{label}</Label>
        </AccordionTrigger>
        <AccordionContent className='p-0.5'>{children}</AccordionContent>
      </AccordionItem>
    </>
  )
}
