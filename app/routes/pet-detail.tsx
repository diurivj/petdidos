import type { Route } from './+types/pet-detail'
import { useEffect, type FormEvent } from 'react'
import { redirect, useFetcher } from 'react-router'
import { Badge } from '~/components/ui/badge'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { AlertCircle, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { prisma } from '~/utils/db.server'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { getSession } from '~/utils/session.server'
import { validateInput } from '~/utils/validate-input'
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent
} from '~/components/ui/select'
import { statusMap } from '~/utils/mappers'
import { PetCard } from '~/components/pet-card'
import { Label } from '~/components/ui/label'
import { useToast } from '~/hooks/use-toast'
import type { PetStatus } from '@prisma/client'

export function meta({ data }: Route.MetaArgs) {
  const title = `Mascota perdida | ${data.pet.breed.name} | Petdidos`
  return [
    { title: title },
    { name: 'description', value: data.pet.description }
  ]
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  const pet = await prisma.pet.findUnique({
    where: { id: params.id },
    include: {
      breed: { select: { name: true } },
      history: {
        select: { id: true, description: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  if (!pet) {
    throw redirect('/')
  }

  const isReporter = pet.reporterId === userId

  return { pet, isReporter, user: Boolean(userId) }
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  if (!userId) {
    throw new Error(`401 - Unauthorized`)
  }
  const formData = await request.formData()
  const description = validateInput(formData.get('description'))
  const status = validateInput(formData.get('status')) as PetStatus

  await prisma.history.create({
    data: { description, status, petId: params.id }
  })

  return null
}

export default function PetDetail({ loaderData }: Route.ComponentProps) {
  const { pet, user, isReporter } = loaderData

  let map: any = undefined

  useEffect(() => {
    if (window !== undefined) {
      if (map !== undefined) return
      const [lng, lat] = pet.location.coordinates
      // @ts-ignore
      map = window.L.map('map').setView([lat, lng], 15)
      // @ts-ignore
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // @ts-ignore
      window.L.marker([lat, lng]).addTo(map)
    }
  }, [])

  const fetcher = useFetcher()
  const editFetcher = useFetcher()
  const isBusy = fetcher.state !== 'idle'

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    fetcher.submit(formData, {
      method: 'post',
      flushSync: true
    })
    e.currentTarget.reset()
  }

  const optimisticStatus = editFetcher.formData?.get('status')

  const optimisticPet = {
    ...pet,
    status: optimisticStatus ?? pet.status
  }

  const { toast } = useToast()

  return (
    <div className='mx-auto max-w-7xl p-4'>
      <div className='mb-6 flex flex-col gap-2'>
        <h1 className='text-3xl font-bold'>Mascota perdida</h1>
        {isReporter ? (
          <editFetcher.Form action='/api/update-pet-status' method='post'>
            <Label>Modificar estatus</Label>
            <Select
              name='status'
              defaultValue={pet.status}
              onValueChange={value => {
                const formData = new FormData()
                formData.append('status', value)
                formData.append('pet-id', pet.id)
                editFetcher.submit(formData, {
                  method: 'post',
                  action: '/api/update-pet-status'
                })
                toast({
                  title: '¡Estatus actualizado!',
                  description: `El nuevo estatus es ${statusMap[value as PetStatus]}`
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Estatus' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'ALIVE'}>{statusMap['ALIVE']}</SelectItem>
                <SelectItem value={'SAFE'}>{statusMap['SAFE']}</SelectItem>
                <SelectItem value={'INJURIED'}>
                  {statusMap['INJURIED']}
                </SelectItem>
                <SelectItem value={'DEAD'}>{statusMap['DEAD']}</SelectItem>
              </SelectContent>
            </Select>
          </editFetcher.Form>
        ) : null}
      </div>
      <div className='grid gap-6 md:grid-cols-2'>
        <PetCard pet={optimisticPet} transitionName={`pet-detail-${pet.id}`} />

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Vista por última vez</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className='z-10 aspect-video w-full rounded-md'
                id='map'
              ></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <fetcher.Form
                  method='post'
                  className='mb-4'
                  onSubmit={handleSubmit}
                >
                  <Textarea
                    required
                    name='description'
                    className='mb-2 resize-none text-sm'
                    placeholder='Agregar actualización'
                  />
                  <Select name='status' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Estatus' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={'ALIVE'}>
                        {statusMap['ALIVE']}
                      </SelectItem>
                      <SelectItem value={'SAFE'}>
                        {statusMap['SAFE']}
                      </SelectItem>
                      <SelectItem value={'INJURIED'}>
                        {statusMap['INJURIED']}
                      </SelectItem>
                      <SelectItem value={'DEAD'}>
                        {statusMap['DEAD']}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type='submit'
                    disabled={isBusy}
                    className='mt-2 w-full'
                  >
                    Agregar actualización
                  </Button>
                </fetcher.Form>
              ) : null}
              {pet.history.length ? (
                <ScrollArea className='h-[200px] overflow-y-scroll pr-4'>
                  {pet.history.map(history => (
                    <div key={history.id} className='mb-4 last:mb-0'>
                      <div className='mb-1 flex items-center gap-2 text-sm text-muted-foreground'>
                        <Calendar className='h-4 w-4' />
                        {new Date(history.createdAt).toLocaleString('es-MX')}
                      </div>
                      <div className='flex items-center gap-x-1'>
                        <Badge variant='outline'>
                          {statusMap[history.status]}
                        </Badge>
                        {history.description}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className='mt-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-yellow-500' />
            Información importante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Si tiene alguna información sobre esta mascota, póngase en contacto.
            No intentes capturar a la mascota tú mismo a menos que esté en
            peligro inminente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
