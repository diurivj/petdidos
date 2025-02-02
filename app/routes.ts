import {
  type RouteConfig,
  index,
  prefix,
  route
} from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('/reportar-mascota', 'routes/report-pet.tsx'),
  route('/encontrar-mascota', 'routes/find-pet.tsx'),
  route('/mascotas', 'routes/pets.tsx'),
  route('/login', 'routes/login.tsx'),
  route('/logout', 'routes/logout.tsx'),
  route('/auth/callback', 'routes/auth-redirect.tsx'),
  route('/mascotas/:id', 'routes/pet-detail.tsx'),
  ...prefix('api', [
    route('get-location-details', 'routes/api.server/get-location-details.ts'),
    route(
      'get-location-suggestions',
      'routes/api.server/get-location-suggestions.ts'
    ),
    route('report-pet', 'routes/api.server/report-pet.ts'),
    route('update-pet-status', 'routes/api.server/update-pet-status.ts')
  ])
] satisfies RouteConfig
