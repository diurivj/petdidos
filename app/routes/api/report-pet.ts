import { redirect } from 'react-router'
import { prisma } from '~/utils/db.server'
import { UTApi } from 'uploadthing/server'
import type { Route } from './+types/report-pet'

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const name = validateInput(formData.get('pet-name') || '')
  const type = validateInput(formData.get('pet-type'))
  const breed = validateInput(formData.get('pet-breed'))
  const coordinates = validateInput(formData.get('coordinates'))
  const date = validateInput(formData.get('pet-last-location-date'))
  const description = validateInput(formData.get('pet-description'))
  const file = validateFileInput(formData.get('pet-photo'))

  const breedId = await prisma.breed.findUnique({
    where: {
      name: breed
    },
    select: { id: true }
  })

  if (!breedId) {
    throw new Error('Invalid breed')
  }

  let photo = ''
  if (file) {
    photo = await uploadFile(file)
  }

  const petCreated = await prisma.pet.create({
    data: {
      name,
      petTypeId: type,
      breedId: breedId.id,
      status: 'ALIVE',
      description,
      photo,
      reporterId: '678287a77df5837d25598439', // TODO: harcoded
      reportDate: new Date(date),
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

function validateFileInput(input: FormDataEntryValue | null) {
  if (!input) return undefined
  if (!(input instanceof File)) {
    throw new Error('Invalid file input')
  }
  return input
}

async function uploadFile(file: File) {
  const token = process.env.UPLOADTHING_TOKEN
  if (!token) {
    throw new Error('Upload thing is not defined')
  }
  const utapi = new UTApi({
    token
  })
  const { data, error } = await utapi.uploadFiles(file)
  if (error) {
    throw error
  }
  return data.url
}
