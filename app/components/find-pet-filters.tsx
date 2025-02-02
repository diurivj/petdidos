import { Form, useFetcher, useLoaderData, useSearchParams } from 'react-router'
import { Button } from './ui/button'
import {
  Dialog,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogFooter
} from './ui/dialog'
import { Input } from './ui/input'
import { FilterOption } from './filter-option'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import type { loader } from '~/routes/find-pet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { petTypeMap } from '~/utils/mappers'
import { Combobox } from './combobox'
import { Accordion } from './ui/accordion'
import { useDebounceFetcher } from '~/utils/use-debounced-fetcher'
import type { action as fetcherAction } from '~/routes/api.server/get-location-details'
import type { action } from '~/routes/report-pet'
import type { Suggestion } from '~/utils/types'
import { MapPin } from 'lucide-react'

export function FindPetFilters() {
  const { petTypes, breeds } = useLoaderData<typeof loader>()

  const [searchParams] = useSearchParams()
  const [petName, setPetName] = useState(searchParams.get('pet-name') || '')
  const [petType, setPetType] = useState(searchParams.get('pet-type') || '')
  const [petBreed, setPetBreed] = useState(searchParams.get('pet-breed') || '')
  const [address, setAddress] = useState('')
  const [showSuggestion, setShowSuggestions] = useState(false)
  const [coordinates, setCoordinates] = useState<number[]>()
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetcher = useDebounceFetcher<Awaited<ReturnType<typeof action>>>()
  const detailsFetcher = useFetcher<Awaited<ReturnType<typeof fetcherAction>>>()

  const ref = useRef(null)

  useEffect(() => {
    if (window !== undefined) {
      if (ref.current) return
      if (!dialogOpen) return

      setTimeout(() => {
        // @ts-ignore
        let map = window.L.map('map').fitWorld()
        // @ts-ignore
        window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map)

        ref.current = map
      }, 500)
    }
  }, [dialogOpen])

  useEffect(() => {
    if (!detailsFetcher.data) return
    const { coordinates } = detailsFetcher.data
    setCoordinates(coordinates)

    if (!dialogOpen || !ref.current) return

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
  }, [detailsFetcher.data, ref.current, dialogOpen])

  function handlePetType(value: string) {
    setPetType(value)
    setPetBreed('')
  }

  function handleOnChangeLocation(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress(e.target.value)
    if (e.target.value === '') return

    const formData = new FormData()
    formData.append('q', e.target.value)
    fetcher.submit(formData, {
      debounceTimeout: 1000,
      action: '/api/get-location-suggestions',
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

  function handleResetForm() {
    setPetName('')
    setPetType('')
    setPetBreed('')
    setAddress('')
    setCoordinates(undefined)
  }

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

  const suggestions = fetcher.data?.suggestions.filter(s =>
    Boolean(s.full_address)
  )

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='default' type='button' className='w-full'>
          Buscar mascota
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[calc(100vw-32px)] rounded-md'>
        <DialogHeader>
          <DialogTitle>Buscar mascota</DialogTitle>
          <DialogDescription>
            Busca tu mascota de manera inteligente
          </DialogDescription>
        </DialogHeader>

        <Form reloadDocument className='my-4' action='/mascotas' id='find-pet'>
          <input name='pet-name' value={petName} required readOnly hidden />
          <input name='pet-type' value={petType} required readOnly hidden />
          <input name='pet-breed' value={petBreed} required readOnly hidden />
          <input
            name='coordinates'
            value={coordinates ? String(coordinates) : ''}
            required
            readOnly
            hidden
          />
          <Accordion
            collapsible
            type='single'
            className='rounded-lg border shadow-sm data-[state=open]:shadow-lg'
          >
            <FilterOption id='name' label='Buscar por nombre'>
              <Input
                id='name'
                name='name'
                value={petName}
                onChange={e => setPetName(e.target.value)}
              />
            </FilterOption>
            <FilterOption id='pet-type' label='Buscar por tipo de mascota'>
              <Select value={petType} onValueChange={handlePetType}>
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
            </FilterOption>
            {petType ? (
              <FilterOption id='pet-breed' label='Buscar por raza'>
                <Combobox
                  open={open}
                  setOpen={setOpen}
                  value={petBreed}
                  setValue={setPetBreed}
                  options={options}
                  zIndex='z-50'
                />
              </FilterOption>
            ) : null}
            <FilterOption id='address' label='Buscar por dirección'>
              <Input
                id='pet-last-location'
                className='mb-2 mt-0.5 text-sm'
                value={address}
                onChange={handleOnChangeLocation}
              />
              {fetcher.state !== 'idle' ? <p>Buscando...</p> : null}
              {fetcher.state === 'idle' &&
              showSuggestion &&
              suggestions?.length ? (
                <ul className='mt-2 space-y-2 rounded-lg shadow-sm'>
                  {suggestions?.map(s => (
                    <li
                      key={s.mapbox_id}
                      className='grid grid-cols-[16px_1fr] items-center gap-2 rounded-lg border p-2'
                      onClick={() => handleSelectAddress(s)}
                    >
                      <MapPin className='size-4' />
                      {s.full_address}
                    </li>
                  ))}
                </ul>
              ) : null}
            </FilterOption>
          </Accordion>
          <div id='map' className='z-10 mt-4 aspect-video w-full'></div>
        </Form>
        <DialogFooter className='gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setDialogOpen(false)}
          >
            Cancelar
          </Button>
          <Button type='submit' form='find-pet'>
            Buscar
          </Button>
          <Button type='button' variant='link' onClick={handleResetForm}>
            Limpiar busqueda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
