import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Petdidos' },
    { name: 'description', content: 'Encuentra tu mascota perdida.' }
  ]
}

export default function Home() {
  return (
    <div className='container mx-auto flex min-h-dvh items-center justify-center'>
      Todo
    </div>
  )
}
