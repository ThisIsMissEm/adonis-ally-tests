import type { HttpContext } from '@adonisjs/core/http'

const OAUTH_PROVIDERS = ['github']

export default class OAuthController {
  async start({ response, params, ally, logger }: HttpContext) {
    if (!OAUTH_PROVIDERS.includes(params.provider)) {
      return response.abort('Unsupported OAuth provider')
    }

    logger.debug(
      { scopes: ally.use(params.provider).config.scopes },
      `OAuth Scopes for ${params.provider}`
    )

    return ally.use(params.provider).redirect()
  }

  async callback({ response, params, ally, session }: HttpContext) {
    if (!OAUTH_PROVIDERS.includes(params.provider)) {
      return response.abort('Unsupported OAuth provider')
    }

    const provider = ally.use(params.provider)

    /**
     * User has denied access by canceling
     * the login flow
     */
    if (provider.accessDenied()) {
      return 'You have cancelled the login process'
    }

    /**
     * OAuth state verification failed. This happens when the
     * CSRF cookie gets expired.
     */
    if (provider.stateMisMatch()) {
      return 'We are unable to verify the request. Please try again'
    }

    /**
     * GitHub responded with some error
     */
    if (provider.hasError()) {
      return provider.getError()
    }

    /**
     * Access user info
     */
    const user = await provider.user()

    session.regenerate()
    session.put('user_info', user)

    return response.redirect().toRoute('oauth.user_info')
  }

  async user_info({ response, session }: HttpContext) {
    if (!session.has('user_info')) {
      return response.redirect().toRoute('home')
    }

    const userInfo = session.get('user_info')

    session.clear()

    return JSON.stringify(userInfo, null, 2)
  }
}
