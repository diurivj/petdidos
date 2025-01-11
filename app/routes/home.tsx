import { useEffect } from 'react'
import type { Route } from './+types/home'
import { MAPBOX_TOKEN } from '~/utils/constants'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Petdidas' },
    { name: 'description', content: 'Encuentra tu mascota perdida.' }
  ]
}

export const links: Route.LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: 'https://api.mapbox.com/mapbox-gl-js/v3.9.2/mapbox-gl.css'
  }
]

export default function Home() {
  return <div id='map' className='h-56 w-96'></div>
}
