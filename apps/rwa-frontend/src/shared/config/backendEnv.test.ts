import { getBackendEnv, getPageBackendEnv } from './backendEnv'
import { getWidgetBaseUrl } from './widget'

const SWAP_PREVIEW_URL = 'https://swap-dev-git-feat-cowswap-dev.vercel.app'
const RWA_PREVIEW_HOST = 'rwa-dev-git-feat-cowswap-dev.vercel.app'

function location(hostname: string): Pick<Location, 'hostname' | 'origin'> {
  return { hostname, origin: `https://${hostname}` }
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL
  window.localStorage.clear()
})

describe('getBackendEnv', () => {
  it.each(['swap.cow.fi', 'staging.swap.cow.fi'])('is prod on %s', (hostname) => {
    expect(getBackendEnv(location(hostname))).toBe('prod')
  })

  it('is barn on dev.swap.cow.fi', () => {
    expect(getBackendEnv(location('dev.swap.cow.fi'))).toBe('staging')
  })

  it('is barn on a preview with a swap-dev preview', () => {
    process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL = SWAP_PREVIEW_URL

    expect(getBackendEnv(location(RWA_PREVIEW_HOST))).toBe('staging')
  })

  it.each([RWA_PREVIEW_HOST, 'swap.cow.fi.evil.com', undefined])(
    'is prod with the production widget on %s',
    (hostname) => {
      const pageLocation = hostname ? location(hostname) : undefined

      expect(getWidgetBaseUrl(pageLocation)).toBeUndefined()
      expect(getBackendEnv(pageLocation)).toBe('prod')
    },
  )

  it('applies the forced env to a widget on the page origin', () => {
    expect(getBackendEnv(location('dev.swap.cow.fi'), 'prod')).toBe('prod')
    expect(getBackendEnv(location('swap.cow.fi'), 'staging')).toBe('staging')
  })

  it('ignores the forced env for a swap-dev preview on another origin', () => {
    process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL = SWAP_PREVIEW_URL

    expect(getBackendEnv(location(RWA_PREVIEW_HOST), 'prod')).toBe('staging')
  })

  it('ignores the forced env for the production widget', () => {
    expect(getBackendEnv(location(RWA_PREVIEW_HOST), 'staging')).toBe('prod')
  })
})

describe('getPageBackendEnv', () => {
  it('follows the widget of the page', () => {
    expect(getPageBackendEnv()).toBe('prod')
  })

  it('reads the forced env from localStorage', () => {
    process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL = window.location.origin
    window.localStorage.setItem('forceProdApi', 'true')

    expect(getPageBackendEnv()).toBe('prod')

    window.localStorage.removeItem('forceProdApi')
    window.localStorage.setItem('forceStagingApi', 'true')
    expect(getPageBackendEnv()).toBe('staging')
  })

  it('prefers forceProdApi, as CoW Swap does', () => {
    process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL = window.location.origin
    window.localStorage.setItem('forceProdApi', 'true')
    window.localStorage.setItem('forceStagingApi', 'true')

    expect(getPageBackendEnv()).toBe('prod')
  })
})
