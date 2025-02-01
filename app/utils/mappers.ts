import type { PetStatus } from '@prisma/client'

export const statusMap: Record<PetStatus, string> = {
  ALIVE: 'Perdida',
  INJURIED: 'Herida',
  SAFE: 'En resguardo',
  DEAD: 'Sin vida'
}

export const petTypeMap: Record<'CAT' | 'DOG', string> = {
  CAT: 'Gato',
  DOG: 'Perro'
}
