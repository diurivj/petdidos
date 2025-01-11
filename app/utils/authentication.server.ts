import { Authenticator } from 'remix-auth'
import { OAuth2Strategy, CodeChallengeMethod } from 'remix-auth-oauth2'

const authenticator = new Authenticator()

authenticator.use(
  new OAuth2Strategy(
    {
      cookie: 'oauth2',
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      authorizationEndpoint: 'https://provider.com/oauth2/authorize',
      tokenEndpoint: 'https://provider.com/oauth2/token',
      redirectURI: 'https://example.app/auth/callback',
      tokenRevocationEndpoint: 'https://provider.com/oauth2/revoke', // optional
      scopes: ['openid', 'email', 'profile']
    },
    async ({ tokens, request }) => {
      console.log(tokens, request)
    }
  ),
  'google-auth'
)
