import { redirect } from 'react-router'
import type { Route } from './+types/logout'
import { destroySession, getSession } from '~/utils/session.server'

export async function loader() {
  return redirect('/')
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  session.unset('userId')

  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session)
    }
  })
}
