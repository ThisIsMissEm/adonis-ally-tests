import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'
import logger from '@adonisjs/core/services/logger'

const githubScopes = env.get('GITHUB_CLIENT_SCOPES', 'read:user user:email').split(' ')
logger.debug({ scopes: githubScopes }, 'GitHub Scopes')

const allyConfig = defineConfig({
  github: services.github({
    clientId: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    callbackUrl: new URL('/github/callback', env.get('PUBLIC_URL')).href,
    scopes: githubScopes,
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
