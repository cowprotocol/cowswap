import { ORDER_BOOK_BASE_URLS } from 'cowSdk'

export const TURNSTILE_SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY || ''
export const TURNSTILE_TOKEN_HEADER_NAME = 'X-Auth-Token'

const DEFAULT_ORDER_BOOK_HOSTS = ['api.cow.fi', 'barn.api.cow.fi']

export const TURNSTILE_API_HOSTS = new Set(
  !ORDER_BOOK_BASE_URLS
    ? DEFAULT_ORDER_BOOK_HOSTS
    : Object.values(ORDER_BOOK_BASE_URLS)
        .map((url) => new URL(url).hostname)
        .filter(Boolean),
)
