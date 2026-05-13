import ms from 'ms.macro'

export const TURNSTILE_DEMO_INTERACTIVE_SITE_KEY = '3x00000000000000000000FF'
export const TURNSTILE_SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY || ''
export const TURNSTILE_AUTH_URL = process.env.REACT_APP_TURNSTILE_AUTH_URL || 'https://barn.api.cow.fi/auth/turnstile' // TODO: remove before prod
export const CAPTCHA_JWT_EXPIRY_BUFFER_MS = ms`10s`
