import { Button } from '~/components/ui/button'
import { authenticator } from '~/utils/authentication.server'
import { getSession } from '~/utils/session.server'
import { Link, redirect } from 'react-router'
import { PawPrint } from 'lucide-react'

import type { Route } from './+types/login'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Iniciar sesión | Petdidos' }]
}

export async function action({ request }: Route.ActionArgs) {
  await authenticator.authenticate('google-auth', request)
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const user = session.get('userId')
  if (user) {
    throw redirect('/reportar-mascota')
  }
  return null
}

export default function Login() {
  return (
    <main className='flex h-dvh flex-col items-center justify-center gap-y-10'>
      <section className='flex flex-col items-center gap-2'>
        <PawPrint className='size-6' fill='currentColor' />
        <Link to='/' className='text-xl font-bold'>
          Petdidos
        </Link>
        <p className='text-sm text-muted-foreground'>
          Encuentra tu mascota perdida
        </p>
      </section>
      <form method='post'>
        <Button variant='outline' className='w-full'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
            <path
              d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
              fill='currentColor'
            />
          </svg>
          Continuar con Google
        </Button>
      </form>
    </main>
  )
}
