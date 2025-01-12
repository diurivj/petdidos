import { Authenticator } from 'remix-auth'
import { OAuth2Strategy } from 'remix-auth-oauth2'
import { prisma } from './db.server'
import type { User as PrismaUser } from '@prisma/client'

type GoogleUser = {
  sub: string
  name: string
  given_name: string
  family_name: string | undefined
  picture: string | undefined
  email: string
  email_verifed: boolean
}

export type User = Omit<PrismaUser, 'createdAt' | 'updatedAt'>

if (!process.env.CLIENT_ID) {
  throw new Error('Client ID is not defined')
}

if (!process.env.CLIENT_SECRET) {
  throw new Error('Client Secret is not defined')
}

export const authenticator = new Authenticator<User>()

authenticator.use(
  new OAuth2Strategy(
    {
      cookie: 'oauth2',
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      redirectURI: 'http://localhost:5173/auth/callback',
      tokenRevocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      scopes: ['openid', 'email', 'profile']
    },
    async ({ tokens }) => {
      const data = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`
          }
        }
      )
      const response: GoogleUser = await data.json()
      const user = await findOrCreateUser(response)
      return user
    }
  ),
  'google-auth'
)

async function findOrCreateUser(googleUser: GoogleUser) {
  const user = await prisma.user.findUnique({
    where: { email: googleUser.email },
    select: {
      photoUrl: true,
      email: true,
      googleId: true,
      name: true,
      id: true
    }
  })
  if (user) return user

  const newUser = await prisma.user.create({
    data: {
      name: googleUser.name,
      googleId: googleUser.sub,
      email: googleUser.email,
      photoUrl: googleUser.picture
    },
    select: {
      photoUrl: true,
      email: true,
      googleId: true,
      name: true,
      id: true
    }
  })

  return newUser
}
