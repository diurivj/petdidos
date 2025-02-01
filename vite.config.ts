import { reactRouter } from '@react-router/dev/vite'
import { reactRouterHonoServer } from 'react-router-hono-server/dev'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer]
    }
  },
  plugins: [reactRouterHonoServer(), reactRouter(), tsconfigPaths()]
})
