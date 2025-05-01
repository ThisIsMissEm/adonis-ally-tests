import type { HttpContext } from '@adonisjs/core/http'

const OAUTH_PROVIDERS = ['github', 'google']

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

  async callback({ response, params, ally, session, logger }: HttpContext) {
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
    const userInfo = await provider.user()

    logger.info({ userInfo }, 'OAuth User Info')

    session.put('user_info', {
      user: userInfo.original,
      provider: params.provider,
      scope: userInfo.token?.scope,
    })

    response.safeHeader('Cache-control', 'no-cache, no-store, max-age=0, must-revalidate')

    return response.redirect().toRoute('oauth.user_info')
  }

  async user_info({ response, session, ally, logger }: HttpContext) {
    response.safeHeader('Cache-control', 'no-cache, no-store, max-age=0, must-revalidate')

    const userInfo = session.pull('user_info', false)

    logger.info({ userInfo }, 'User info')
    if (!userInfo) {
      return response.redirect().toRoute('home')
    }

    return response.safeStatus(200).send(
      JSON.stringify(
        {
          ...userInfo,
          requestedScopes: userInfo.provider && ally.use(userInfo.provider).config.scopes,
        },
        null,
        2
      )
    )
  }
}
