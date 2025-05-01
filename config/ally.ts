import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'

const allyConfig = defineConfig({
  github: services.github({
    clientId: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    callbackUrl: new URL('/github/callback', env.get('PUBLIC_URL')).href,
    scopes: env.get('GITHUB_CLIENT_SCOPES', 'read:user user:email').split(' '),
  }),
  google: services.google({
    clientId: env.get('GOOGLE_CLIENT_ID'),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
    callbackUrl: new URL('/google/callback', env.get('PUBLIC_URL')).href,

    // Google specific
    prompt: 'select_account',
    accessType: 'offline',
    hostedDomain: new URL(env.get('PUBLIC_URL')).hostname,
    display: 'page',
    scopes: env.get('GOOGLE_CLIENT_SCOPES', 'userinfo.email').split(' '),
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
