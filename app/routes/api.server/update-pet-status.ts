import { redirect } from 'react-router'
import { getSession } from '~/utils/session.server'
import { prisma } from '~/utils/db.server'
import { validateInput } from '~/utils/validate-input'
import type { PetStatus } from '@prisma/client'
import type { Route } from './+types/update-pet-status'

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')

  if (!userId) throw redirect('/', { status: 401 })

  const formData = await request.formData()
  const petId = validateInput(formData.get('pet-id'))
  const status = validateInput(formData.get('status')) as PetStatus

  const pet = await prisma.pet.update({
    where: { id: petId, reporterId: userId },
    data: { status }
  })

  return { pet }
}
