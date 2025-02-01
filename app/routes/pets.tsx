import { prisma } from '~/utils/db.server'
import { useEffect, useRef, useState } from 'react'
import { formatRawPets } from '~/utils/formatter'
import { PetCard } from '~/components/pet-card'
import { Link, useFetcher, useSearchParams } from 'react-router'
import type { Route } from './+types/pets'

const KM = 0.00015781359160347566 as const
const limit = 5 as const

export function meta() {
  return [{ title: 'Mascotas perdidas | Petdidos' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams
  const petName = searchParams.get('pet-name')
  const petType = searchParams.get('pet-type')
  const petBreed = searchParams.get('pet-breed')
  const coordinates = searchParams.get('coordinates')
  const page = searchParams.get('page') || '0'

  let breedId: string | undefined = undefined
  if (petBreed && petType) {
    const breed = await prisma.breed.findUnique({
      where: { name: petBreed, petTypeId: petType },
      select: { id: true }
    })
    if (breed) {
      breedId = breed.id
    }
  }

  const [lat, lng] = coordinates ? coordinates?.split(',') : []

  const filters = []

  if (petName) {
    filters.push({
      name: { $regex: petName, $options: 'i' }
    })
  }

  if (breedId && petType) {
    filters.push({ breedId: { $oid: breedId } })
  }

  if (!breedId && petType) {
    filters.push({ petTypeId: { $oid: petType } })
  }

  if (coordinates && lat !== null && lng !== null) {
    filters.push({
      location: {
        $geoWithin: {
          $centerSphere: [[Number(lat), Number(lng)], KM * 20]
        }
      }
    })
  }

  const rawPets = await prisma.pet.aggregateRaw({
    pipeline: [
      {
        $match: {
          $or: filters.length ? [{ $and: filters }] : [{}]
        }
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }], // Count the total number of matching documents
          results: [
            {
              $lookup: {
                from: 'Breed',
                localField: 'breedId',
                foreignField: '_id',
                as: 'breed',
                pipeline: [{ $project: { _id: 1, name: 1 } }]
              }
            },
            {
              $unwind: {
                path: '$breed',
                preserveNullAndEmptyArrays: true
              }
            },
            { $sort: { updatedAt: -1 } },
            { $skip: Number(page || 0) * (limit || 10) },
            { $limit: limit || 10 }
          ]
        }
      }
    ]
  })

  const result = (rawPets as unknown as Array<any>)[0]
  const count = result.totalCount[0].count as number

  const pets = formatRawPets(result.results as unknown as Array<any>)
  return { pets, count }
}

export default function Pets({ loaderData }: Route.ComponentProps) {
  const { count, pets } = loaderData

  const [data, setData] = useState(pets)
  const [page, setPage] = useState(0)

  const [searchParams] = useSearchParams()
  const fetcher = useFetcher<typeof loader>()

  const ref = useRef(null)
  useEffect(() => {
    if (window !== undefined) {
      if (ref.current) return

      // @ts-ignore
      let map = window.L.map('map').fitWorld()
      // @ts-ignore
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      const [lng, lat] = pets[0].location.coordinates
      map.setView([lat, lng], 10)

      pets.map(pet => {
        const [lng, lat] = pet.location.coordinates
        // @ts-ignore
        const marker = window.L.marker([lat, lng]).addTo(map)
        marker.bindPopup(
          `<a href="/mascotas/${pet.id}" target="_blank">${pet.name || 'Mascota perdida'}</a>`
        )
      })

      ref.current = map
    }
  }, [])

  useEffect(() => {
    if (fetcher.state !== 'idle') return
    const newData = fetcher.data
    if (!newData) return

    setData(prevState => {
      return [...prevState, ...newData.pets]
    })
  }, [fetcher])

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const isBottom =
      e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
      e.currentTarget.scrollHeight

    if (isBottom && data.length < count && fetcher.state === 'idle') {
      fetcher.load(`/mascotas?${searchParams.toString()}&page=${page + 1}`)
      setPage(page + 1)
    }
  }

  return (
    <div className='mx-auto grid min-h-svh w-full max-w-7xl grid-cols-1 gap-6 bg-background p-4 md:p-10'>
      <section className='flex flex-col gap-4'>
        <h4 className='text-sm'>
          Se encontraron más de {count - 1} mascotas perdidas
        </h4>
        <div id='map' className='z-10 aspect-video w-full'></div>
      </section>

      <section
        className='grid h-[70vh] grid-cols-1 gap-4 overflow-y-scroll md:h-[85vh] md:grid-cols-3'
        onScroll={handleScroll}
      >
        {data.map(pet => (
          <Link
            viewTransition
            key={pet.id}
            to={`/mascotas/${pet.id}`}
            prefetch='viewport'
            style={{ viewTransitionName: `pet-detail-${pet.id}` }}
          >
            <PetCard key={pet.id} pet={pet} />
          </Link>
        ))}
        {data.length === count ? (
          <p className='self-end text-center text-muted-foreground'>
            Ya no hay más mascotas que mostrar
          </p>
        ) : null}
      </section>
    </div>
  )
}
