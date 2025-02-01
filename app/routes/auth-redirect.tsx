import { redirect } from 'react-router'
import { authenticator } from '~/utils/authentication.server'
import { commitSession, getSession } from '~/utils/session.server'

import type { Route } from './+types/auth-redirect'

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authenticator.authenticate('google-auth', request)
  const session = await getSession(request.headers.get('cookie'))
  session.set('userId', user.id)
  return redirect('/reportar-mascota', {
    headers: {
      'Set-Cookie': await commitSession(session)
    }
  })
}
