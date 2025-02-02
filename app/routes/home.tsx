import { Cat, Dog, MapPinned } from 'lucide-react'
import { buttonVariants } from '~/components/ui/button'
import { Link } from 'react-router'
import { getMeta } from '~/utils/seo'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Petdidos' },
    { name: 'description', content: 'Encuentra tu mascota perdida.' },
    ...getMeta({
      'og:description': 'Encuentra tu mascota perdida.',
      'og:image': 'https://petdidos.fly.dev/assets/meta.jpg',
      'og:site_name': 'Petdidos',
      'og:title': 'Petdidos',
      'twitter:card': 'summary_large_image',
      'twitter:image': 'https://petdidos.fly.dev/assets/meta.jpg',
      'twitter:title': 'Petdidos',
      'twitter:description': 'Encuentra tu mascota perdida.'
    })
  ]
}

export default function Home() {
  return (
    <main className='mx-auto flex min-h-dvh max-w-7xl flex-col gap-20 p-4'>
      <section className='flex flex-col items-center justify-center gap-4'>
        <h1 className='scroll-m-20 text-center text-4xl font-extrabold tracking-tight lg:text-5xl'>
          Encuentra a tu mejor amigo
        </h1>
        <p className='text-center text-muted-foreground'>
          El mejor lugar para localizar, reportar y dar seguimiento a nuestros
          amigos peluditos para que regresen a casa.
        </p>
      </section>

      <section className='flex flex-col items-center justify-center gap-4'>
        <MapPinned className='size-40' />
        <Link
          to='/encontrar-mascota'
          className={buttonVariants({ size: 'lg' })}
        >
          Encontrar mascota perdida
        </Link>
      </section>

      <section className='grid grid-cols-1 items-center justify-center gap-10'>
        <div className='flex w-full flex-col items-center justify-center gap-y-2'>
          <Dog className='size-40' />
          <h2 className='scroll-m-20 text-2xl font-semibold tracking-tight'>
            Encuentra a tu mascota perdida
          </h2>
          <p className='text-center text-muted-foreground'>
            Si perdiste tu mascota, no estás solo. Con amor, esfuerzo y la ayuda
            de nuestra comunidad, haremos todo lo posible para reunirlos de
            nuevo. 🥰 ¡Tu amigo peludo te está esperando!
          </p>
          <Link
            to='/encontrar-mascota'
            className={buttonVariants({ variant: 'outline' })}
          >
            Busca a tu mascota
          </Link>
        </div>
        <div className='flex w-full flex-col items-center justify-center gap-y-2'>
          <Cat className='size-40' />
          <h2 className='scroll-m-20 text-2xl font-semibold tracking-tight'>
            Reportar una mascota perdida
          </h2>
          <p className='text-center text-muted-foreground'>
            🐾 ¿Encontraste una mascota perdida? Alguien la está buscando. 📢
            Reporta su hallazgo ahora y ayúdanos a reunirla con su familia. 💙
            Un pequeño gesto puede hacer una gran diferencia. 👉 ¡Reportar
            mascota encontrada!
          </p>
          <Link
            to='/reportar-mascota'
            className={buttonVariants({ variant: 'outline' })}
          >
            Reportar mascota perdida
          </Link>
        </div>
      </section>

      <footer className='text-center text-xs text-muted-foreground'>
        {new Date().getFullYear()} | diurivj & asociados
      </footer>
    </main>
  )
}
