import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from 'react-router'
import { Navbar } from './components/navbar'
import { getSession } from './utils/session.server'
import { Toaster } from './components/ui/toaster'

import type { Route } from './+types/root'

import stylesheet from './app.css?url'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
  },
  {
    rel: 'stylesheet',
    href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
    crossOrigin: 'anonymous'
  },
  { rel: 'stylesheet', href: stylesheet }
]

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const userId = session.get('userId')
  return { userId }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no'
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <script
          src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
          crossOrigin='anonymous'
        ></script>
      </body>
    </html>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster />
    </>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className='container mx-auto p-4 pt-16'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full overflow-x-auto p-4'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
