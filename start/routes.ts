/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const OAuthController = () => import('#controllers/oauth_controller')

router.on('/').render('pages/home').as('home')
router.get('/:provider/start', [OAuthController, 'start']).as('oauth.start')
router.get('/:provider/callback', [OAuthController, 'callback']).as('oauth.callback')

router.get('/user_info', [OAuthController, 'user_info']).as('oauth.user_info')
