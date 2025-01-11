import {
  type RouteConfig,
  index,
  prefix,
  route
} from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('/reportar-mascota', 'routes/report-pet.tsx'),
  route('/login', 'routes/login.tsx'),
  ...prefix('api', [
    route('get-location-details', 'routes/api/get-location-details.ts'),
    route('report-pet', 'routes/api/report-pet.ts')
  ])
] satisfies RouteConfig
