import { MAPBOX_SESSION } from '~/utils/constants'
import type { Suggestion } from '~/utils/types'

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
