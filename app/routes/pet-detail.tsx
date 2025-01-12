import type { Route } from './+types/pet-detail'
import { useEffect } from 'react'
import { redirect } from 'react-router'
import { Badge } from '~/components/ui/badge'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { AlertCircle, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { prisma } from '~/utils/db.server'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { getSession } from '~/utils/session.server'
import { validateInput } from '~/utils/validate-input'
import { PetStatus } from '@prisma/client'
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent
} from '~/components/ui/select'

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
        select: { id: true, description: true, status: true, createdAt: true }
      }
    }
  })
  if (!pet) {
    throw redirect('/')
  }
  return { pet, user: Boolean(userId) }
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  if (!userId) {
    throw new Error(`401 - Unauthorized`)
  }

  const formData = await request.formData()
  const description = validateInput(formData.get('description'))
  const status =
    PetStatus[validateInput(formData.get('status')) as keyof typeof PetStatus]

  await prisma.history.create({
    data: { description, status, petId: params.id }
  })

  return null
}

export default function PetDetail({ loaderData }: Route.ComponentProps) {
  const { pet, user } = loaderData

  const placeholder =
    'https://g7yqo0nubd.ufs.sh/f/TSY9Jmw2oEfqJ4gJIJAbflg9ioJVZtLn1jCpFxEdh3bQ85GR'

  useEffect(() => {
    if (window !== undefined) {
      const [lng, lat] = pet.location.coordinates
      // @ts-ignore
      let map = window.L.map('map').setView([lat, lng], 15)
      // @ts-ignore
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // @ts-ignore
      window.L.marker([lat, lng]).addTo(map)
    }
  }, [])

  return (
    <div className='container mx-auto max-w-4xl p-4'>
      <h1 className='mb-6 text-3xl font-bold'>Mascota perdida</h1>
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardContent className='p-0'>
            <img
              src={pet.photo || placeholder}
              alt={pet.name || 'Mascota perdida'}
              width={500}
              height={500}
              className='aspect-square h-auto w-full rounded-t-lg object-cover'
            />
          </CardContent>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>{pet.name || 'Mascota perdida (Sin nombre)'}</span>
              <Badge variant='secondary'>{pet.breed.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Vista por última vez:
            </p>
            <p>{new Date(pet.reportDate).toLocaleString('es-MX')}</p>
            <p className='mt-4'>{pet.description}</p>
          </CardContent>
        </Card>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Vista por última vez</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='aspect-video w-full rounded-md' id='map'></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <form method='post' className='mb-4'>
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
                      <SelectItem value={PetStatus.ALIVE}>Perdido</SelectItem>
                      <SelectItem value={PetStatus.SAFE}>
                        Resguardado
                      </SelectItem>
                      <SelectItem value={PetStatus.INJURIED}>Herido</SelectItem>
                      <SelectItem value={PetStatus.DEAD}>Sin vida</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type='submit' className='mt-2 w-full'>
                    Agregar actualización
                  </Button>
                </form>
              ) : null}
              {pet.history.length ? (
                <ScrollArea className='h-[200px] pr-4'>
                  {pet.history.map(history => (
                    <div key={history.id} className='mb-4 last:mb-0'>
                      <div className='mb-1 flex items-center gap-2 text-sm text-muted-foreground'>
                        <Calendar className='h-4 w-4' />
                        {new Date(history.createdAt).toLocaleString('es-MX')}
                      </div>
                      <div className='flex items-center gap-x-1'>
                        <Badge variant='outline'>{history.status}</Badge>
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
