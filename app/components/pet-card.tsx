import { statusMap } from '~/utils/mappers'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import type { Breed, Pet } from '@prisma/client'

type PetCardProps = {
  pet: Pet & { breed: Pick<Breed, 'name'> }
  transitionName?: string
}

export function PetCard({ pet, transitionName }: PetCardProps) {
  const placeholder =
    'https://g7yqo0nubd.ufs.sh/f/TSY9Jmw2oEfqJ4gJIJAbflg9ioJVZtLn1jCpFxEdh3bQ85GR'

  return (
    <Card
      style={{ viewTransitionName: transitionName ?? 'unset' }}
      className='h-full overflow-hidden'
    >
      <CardContent className='p-0'>
        <img
          src={pet.photo || placeholder}
          alt={pet.name || 'Mascota perdida'}
          width={500}
          height={500}
          className='aspect-square h-auto w-full rounded-t-lg object-cover'
        />
      </CardContent>
      <CardHeader>
        <CardTitle className='flex items-start justify-between'>
          <div className='flex flex-col gap-y-0.5'>
            <span>{pet.name || 'Mascota perdida (Sin nombre)'}</span>
            <p className='text-xs font-light text-muted-foreground'>
              {statusMap[pet.status]}
            </p>
          </div>
          <Badge variant='secondary'>{pet.breed.name}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-muted-foreground'>Vista por última vez:</p>
        <p>
          {new Date(pet.reportDate).toLocaleDateString('es-MX', {
            dateStyle: 'long'
          })}
        </p>
        <p className='mt-4'>{pet.description}</p>
      </CardContent>
    </Card>
  )
}
