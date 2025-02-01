import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Info } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import type { Route } from './+types/report-pet'
import { type action as fetcherAction } from './api.server/get-location-details'
import { prisma } from '~/utils/db.server'
import { MAPBOX_SESSION } from '~/utils/constants'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Combobox } from '~/components/combobox'
import { useDebounceFetcher } from '~/utils/use-debounced-fetcher'
import { redirect, useFetcher } from 'react-router'
import { getSession } from '~/utils/session.server'
import { PetStatus } from '@prisma/client'
import { petTypeMap, statusMap } from '~/utils/mappers'
import type { Suggestion } from '~/utils/types'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Reportar mascota | Petdidas' }]
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const q = formData.get('q')

  if (!q || typeof q !== 'string') {
    throw new Error('Something went wrong')
  }

  const { MAPBOX_TOKEN } = process.env
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token is not defined')
  }

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/suggest?q=${q}&access_token=${MAPBOX_TOKEN}&session_token=${MAPBOX_SESSION}`
  )

  const data = await response.json()
  return { suggestions: data.suggestions as Suggestion[] }
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const userId = session.get('userId')

  if (!userId) {
    throw redirect('/login')
  }

  const breeds = await prisma.breed.findMany({
    select: { name: true, petTypeId: true }
  })
  const petTypes = await prisma.petType.findMany({
    select: { name: true, id: true }
  })

  return {
    breeds,
    petTypes
  }
}

export default function ReportPet({ loaderData }: Route.ComponentProps) {
  const { petTypes, breeds } = loaderData

  const [petType, setPetType] = useState('')
  const [petBreed, setPetBreed] = useState('')
  const [address, setAddress] = useState('')
  const [open, setOpen] = useState(false)
  const [showSuggestion, setShowSuggestions] = useState(false)
  const [coordinates, setCoordinates] = useState<number[]>()

  const fetcher = useDebounceFetcher<Awaited<ReturnType<typeof action>>>()
  const detailsFetcher = useFetcher<Awaited<ReturnType<typeof fetcherAction>>>()

  const options = useMemo(() => {
    return breeds
      .filter(breed => {
        return petType ? breed.petTypeId === petType : true
      })
      .map(breed => ({
        label: breed.name,
        value: breed.name
      }))
  }, [petType, breeds])

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
      ref.current = map
    }
  }, [])

  useEffect(() => {
    if (!detailsFetcher.data) return
    const { coordinates } = detailsFetcher.data
    setCoordinates(coordinates)

    const [lng, lat] = coordinates
    // @ts-ignore
    const marker = window.L.marker([lat, lng], { draggable: true }).addTo(
      ref.current
    )
    // @ts-ignore
    ref.current.setView([lat, lng], 15)
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng()
      setCoordinates([lng, lat])
      // @ts-ignore
      ref.current.setView([lat, lng], 15)
    })
  }, [detailsFetcher.data])

  function handleOnChangeLocation(e: ChangeEvent<HTMLInputElement>) {
    setAddress(e.target.value)
    if (e.target.value === '') return

    const formData = new FormData()
    formData.append('q', e.target.value)
    fetcher.submit(formData, {
      debounceTimeout: 1000,
      method: 'post'
    })
    setShowSuggestions(true)
  }

  function handleSelectAddress(address: Suggestion) {
    const formData = new FormData()
    formData.append('id', address.mapbox_id)
    detailsFetcher.submit(formData, {
      method: 'post',
      action: '/api/get-location-details'
    })

    setAddress(address.full_address)
    setShowSuggestions(false)
  }

  function handlePetType(value: string) {
    setPetType(value)
    setPetBreed('')
  }

  const suggestions = fetcher.data?.suggestions.filter(s =>
    Boolean(s.full_address)
  )

  const isDisabled = !coordinates || !petType || !petBreed

  return (
    <main className='mx-auto w-full max-w-7xl p-4'>
      <h1 className='scroll-m-20 text-3xl font-semibold tracking-tight'>
        Reportar mascota
      </h1>
      <p className='mt-2 text-sm text-muted-foreground'>
        Agrega todos los detalles posibles, para hacer la búsqueda más sencilla.
      </p>

      <form
        method='post'
        action='/api/report-pet'
        encType='multipart/form-data'
        className='my-7 grid grid-cols-2 gap-4'
      >
        <div className='col-span-full space-y-0.5'>
          <Label htmlFor='pet-photo'>Foto</Label>
          <Input id='pet-photo' name='pet-photo' type='file' accept='image/*' />
        </div>
        <div className='col-span-full space-y-0.5'>
          <Label htmlFor='pet-name'>Nombre</Label>
          <Input id='pet-name' name='pet-name' className='text-sm' />
        </div>
        <div className='col-span-full space-y-0.5 lg:col-span-1'>
          <Label htmlFor='pet-type'>Tipo de mascota</Label>
          <Select required value={petType} onValueChange={handlePetType}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Tipo de mascota' />
            </SelectTrigger>
            <SelectContent>
              {petTypes.map(petType => (
                <SelectItem key={petType.name} value={petType.id}>
                  {petTypeMap[petType.name as 'DOG' | 'CAT']}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            id='pet-type'
            name='pet-type'
            value={petType}
            required
            readOnly
            hidden
          />
        </div>
        <div className='col-span-full flex flex-col justify-end gap-y-1 lg:col-span-1'>
          <Label htmlFor='pet-breed'>Raza</Label>
          <Combobox
            open={open}
            setOpen={setOpen}
            value={petBreed}
            setValue={setPetBreed}
            options={options}
          />
          <input
            id='pet-breed'
            name='pet-breed'
            value={petBreed}
            required
            readOnly
            hidden
          />
        </div>
        <div className='col-span-full'>
          <Label htmlFor='pet-status'>Estatus</Label>

          <Select name='pet-status' required>
            <SelectTrigger>
              <SelectValue placeholder='Estatus' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PetStatus.ALIVE}>
                {statusMap['ALIVE']}
              </SelectItem>
              <SelectItem value={PetStatus.SAFE}>
                {statusMap['SAFE']}
              </SelectItem>
              <SelectItem value={PetStatus.INJURIED}>
                {statusMap['INJURIED']}
              </SelectItem>
              <SelectItem value={PetStatus.DEAD}>
                {statusMap['DEAD']}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='col-span-full lg:col-span-1'>
          <Label htmlFor='pet-last-location'>
            Lugar en el que fue visto por última vez
          </Label>
          <Input
            id='pet-last-location'
            className='mb-2 mt-0.5 text-sm'
            value={address}
            onChange={handleOnChangeLocation}
          />
          {fetcher.state !== 'idle' ? <p>Buscando...</p> : null}
          {fetcher.state === 'idle' && showSuggestion && suggestions?.length ? (
            <ul className='mt-2 space-y-2 rounded-lg border p-2 shadow-sm'>
              {suggestions?.map(s => (
                <li
                  key={s.mapbox_id}
                  className='rounded-lg border p-2'
                  onClick={() => handleSelectAddress(s)}
                >
                  {s.full_address}
                </li>
              ))}
            </ul>
          ) : null}
          <div id='map' className='z-10 aspect-video w-full'></div>
          <input
            id='coordinates'
            name='coordinates'
            value={String(coordinates)}
            required
            readOnly
            hidden
          />
        </div>
        <div className='col-span-full space-y-0.5 lg:col-span-1'>
          <Label htmlFor='pet-last-location-date'>
            Cuando fue visto por última vez
          </Label>
          <Input
            id='pet-last-location-date'
            name='pet-last-location-date'
            className='text-sm'
            type='datetime-local'
            required
          />
        </div>
        <div className='col-span-full space-y-0.5'>
          <Label htmlFor='pet-description'>Descripción</Label>
          <Textarea
            rows={5}
            id='pet-description'
            name='pet-description'
            className='resize-none text-sm'
            required
          ></Textarea>
        </div>
        <div className='col-span-full space-y-0.5'>
          <Label htmlFor='reporter-phone'>Tu teléfono</Label>
          <Input
            id='reporter-phone'
            name='reporter-phone'
            className='text-sm'
          />
        </div>
        <div className='col-span-full grid grid-cols-[15px_1fr] items-center gap-x-2 py-2 text-muted-foreground'>
          <Info className='size-3 text-inherit' />
          <p className='text-sm'>
            Tu información será utilizada como método de contacto y no será
            expuesta publicamente.
          </p>
        </div>
        <Button
          size='lg'
          disabled={isDisabled}
          className='col-span-full'
          type='submit'
        >
          Reportar mascota
        </Button>
      </form>
    </main>
  )
}
