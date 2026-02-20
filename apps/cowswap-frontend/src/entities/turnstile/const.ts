export const TURNSTILE_SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY || ''
export const TURNSTILE_TOKEN_HEADER_NAME = 'X-Auth-Token'

const DEFAULT_ORDER_BOOK_HOSTS = ['api.cow.fi', 'barn.api.cow.fi']

function getOrderBookApiHosts(): string[] {
  const urls = process.env.REACT_APP_ORDER_BOOK_URLS

  if (!urls) return DEFAULT_ORDER_BOOK_HOSTS

  try {
    const parsedUrls = JSON.parse(urls) as Record<string, string>
    const hosts = Object.values(parsedUrls)
      .map((url) => {
        try {
          return new URL(url).hostname
        } catch {
          return null
        }
      })
      .filter((host): host is string => Boolean(host))

    return hosts.length ? hosts : DEFAULT_ORDER_BOOK_HOSTS
  } catch {
    return DEFAULT_ORDER_BOOK_HOSTS
  }
}

export const TURNSTILE_API_HOSTS = getOrderBookApiHosts()
