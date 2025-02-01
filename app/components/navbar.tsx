import {
  Binoculars,
  House,
  LogOut,
  MapPinned,
  Menu,
  PawPrint
} from 'lucide-react'
import { Link, NavLink, useRouteLoaderData } from 'react-router'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Button } from './ui/button'
import { cn } from '~/lib/utils'
import { useState } from 'react'

import type { loader } from '~/root'

export function Navbar() {
  return (
    <nav className='mx-auto flex w-full max-w-7xl items-center justify-between p-4 shadow-md md:border-b md:shadow-none'>
      <Link to='/' className='flex items-center gap-x-2 text-xl font-bold'>
        <PawPrint className='size-5' fill='currentColor' />
        Petdidos
      </Link>
      <NavbarMenu />
    </nav>
  )
}

function NavbarMenu() {
  const links = [
    { name: 'Inicio', to: '/', icon: House },
    { name: 'Encontrar mascota', to: '/encontrar-mascota', icon: Binoculars },
    { name: 'Reportar mascota', to: '/reportar-mascota', icon: MapPinned }
  ]

  const [open, setOpen] = useState(false)
  const loaderData = useRouteLoaderData<typeof loader>('root')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='icon' variant='outline'>
          <Menu />
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        onOpenAutoFocus={e => e.preventDefault()}
        className='w-[calc(100vw-32px)] rounded-md'
      >
        <DialogHeader>
          <DialogTitle className='px-0 text-left'>Petdidos</DialogTitle>
        </DialogHeader>
        <div className='mt-4 flex flex-col gap-4'>
          {links.map(link => (
            <NavLink
              reloadDocument
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-4 rounded-xl px-4 py-4 text-lg outline-none',
                  isActive && 'border border-primary shadow-md',
                  'focus:ring-1 focus:ring-gray-400 focus:ring-offset-2'
                )
              }
            >
              <link.icon className='size-5' />
              {link.name}
            </NavLink>
          ))}
        </div>
        <DialogFooter>
          {Boolean(loaderData?.userId) ? (
            <form action='/logout' method='post' className='w-full'>
              <button className='flex w-full items-center gap-4 rounded-xl px-4 py-4 text-lg outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-2'>
                <LogOut className='size-5' />
                Cerrar sesión
              </button>
            </form>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
