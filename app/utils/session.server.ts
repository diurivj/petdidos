import { createCookieSessionStorage } from 'react-router'
import type { User } from './authentication.server'

type SessionData = {
  userId: User['id']
}

type SessionFlashData = {
  error: string
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
      secrets: ['_p3td1d4s'],
      secure: process.env.NODE_ENV === 'production'
    }
  })

export { getSession, commitSession, destroySession }
