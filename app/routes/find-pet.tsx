import { Binoculars } from 'lucide-react'
import { Link } from 'react-router'
import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { prisma } from '~/utils/db.server'
import { PetCard } from '~/components/pet-card'
import { FindPetFilters } from '~/components/find-pet-filters'

import type { Route } from './+types/find-pet'

export function meta() {
  return [{ title: 'Encontrar mascota | Petdidos' }]
}

export async function loader() {
  const pets = await prisma.pet.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { breed: { select: { name: true } } }
  })

  const breeds = await prisma.breed.findMany({
    select: { name: true, petTypeId: true, id: true }
  })

  const petTypes = await prisma.petType.findMany({
    select: { name: true, id: true }
  })

  return { pets, petTypes, breeds }
}

export default function FindPet({ loaderData }: Route.ComponentProps) {
  const { pets } = loaderData

  return (
    <div className='mx-auto flex min-h-svh w-full max-w-7xl flex-col items-center justify-start gap-6 bg-background p-4 md:p-10'>
      <div className={cn('flex flex-col gap-6')}>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center gap-2'>
            <Link
              to='/'
              className='flex flex-col items-center gap-2 font-medium'
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-md'>
                <Binoculars className='size-6' />
              </div>
              <span className='sr-only'>Petdidos</span>
            </Link>
            <h1 className='text-xl font-bold'>Encuentra tu mascota perdida</h1>
            <div className='text-center text-sm text-muted-foreground'>
              Recibe ayuda para encontrar tu mascota
            </div>
          </div>
          <FindPetFilters />
          <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'></div>
        </div>
        <section className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {pets.map(pet => (
            <Link
              viewTransition
              key={pet.id}
              to={`/mascotas/${pet.id}`}
              style={{ viewTransitionName: `pet-detail-${pet.id}` }}
            >
              <PetCard pet={pet} />
            </Link>
          ))}
          <Link
            to='/mascotas'
            className={buttonVariants({
              size: 'lg',
              variant: 'outline',
              className: 'col-span-full'
            })}
          >
            Ver todas las mascotas perdidas
          </Link>
        </section>
      </div>
    </div>
  )
}
