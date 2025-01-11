import { prisma } from '../app/utils/db.server'
import { catBreeds, dogBreeds } from './breeds'

const CAT = 'CAT' as const
const DOG = 'DOG' as const

export async function seed() {
  console.log('🌱 Seeding...')
  console.time('🌱 Database has been seeded')

  // Generate pet types
  //const catType = await prisma.petType.create({
  //  data: { name: CAT },
  //  select: { id: true },
  //})
  //console.log(`Added ${CAT} type.`)
  //
  //const dogType = await prisma.petType.create({
  //  data: { name: DOG },
  //  select: { id: true },
  //})
  //console.log(`Added ${DOG} type.`)
  //
  //// Add Dog breeds
  //const breeds = await prisma.breed.createMany({
  //  data: [
  //    ...catBreeds.map(({ name }) => ({ name, petTypeId: catType.id })),
  //    ...dogBreeds.map(({ name }) => ({ name, petTypeId: dogType.id })),
  //  ],
  //})
  //
  //console.log(`Added ${breeds.count} breeds.`)
  console.timeEnd('🌱 Database has been seeded')
}

seed()
