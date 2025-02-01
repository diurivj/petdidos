import type { Breed, Pet as PrismaPet } from '@prisma/client'

type Pet = PrismaPet & { breed: Pick<Breed, 'name'> }

export function formatRawPets(rawPets: Array<any>): Array<Pet> {
  return rawPets.map(rawPet => {
    return {
      id: rawPet._id.$oid,
      name: rawPet.name,
      breedId: rawPet.breedId.$oid,
      breed: {
        name: rawPet.breed.name
      },
      petTypeId: rawPet.petTypeId.$oid,
      contactPhone: rawPet.contactPhone,
      description: rawPet.description,
      location: rawPet.location,
      photo: rawPet.photo,
      reportDate: rawPet.reportDate.$date,
      reporterId: rawPet.reporterId.$oid,
      status: rawPet.status,
      createdAt: rawPet.createdAt.$date,
      updatedAt: rawPet.updatedAt.$date
    }
  })
}
