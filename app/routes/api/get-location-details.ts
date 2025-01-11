import { MAPBOX_SESSION } from '~/utils/constants'
import type { Route } from './+types/get-location-details'

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const id = formData.get('id')

  if (!id || typeof id !== 'string') {
    throw new Error('Something went wrong')
  }

  const { MAPBOX_TOKEN } = process.env
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token is not defined')
  }

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${id}?access_token=${MAPBOX_TOKEN}&session_token=${MAPBOX_SESSION}`
  )

  const data = await response.json()
  return { coordinates: data.features[0].geometry.coordinates as number[] }
}
