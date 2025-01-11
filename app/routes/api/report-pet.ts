import { redirect } from 'react-router'
import { prisma } from '~/utils/db.server'
import type { Route } from './+types/report-pet'

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const name = validateInput(formData.get('pet-name') || '')
  const type = validateInput(formData.get('pet-type'))
  const breed = validateInput(formData.get('pet-breed'))
  const coordinates = validateInput(formData.get('coordinates'))
  const date = validateInput(formData.get('pet-last-location-date'))
  const description = validateInput(formData.get('pet-description'))

  const breedId = await prisma.breed.findUnique({
    where: {
      name: breed
    },
    select: { id: true }
  })

  if (!breedId) {
    throw new Error('Invalid breed')
  }

  const petCreated = await prisma.pet.create({
    data: {
      name,
      petTypeId: type,
      breedId: breedId.id,
      status: 'ALIVE',
      description,
      location: {
        type: 'Point',
        coordinates: coordinates.split(',').map(Number)
      }
    }
  })

  return redirect(`/encontrar/mascota/${petCreated.id}`)
}

function validateInput(input: FormDataEntryValue | null) {
  if (typeof input !== 'string') {
    throw new Error('Invalid payload')
  }
  return input
}
