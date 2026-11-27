import { getExplorerBaseUrl } from './explorer'

const SWAP_PREVIEW_URL = 'https://swap-dev-git-feat-cowswap-dev.vercel.app'
const RWA_PREVIEW_HOST = 'rwa-dev-git-feat-cowswap-dev.vercel.app'

function location(hostname: string): Pick<Location, 'hostname' | 'origin'> {
  return { hostname, origin: `https://${hostname}` }
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL
})

describe('getExplorerBaseUrl', () => {
  it.each([
    ['swap.cow.fi', 'https://explorer.cow.fi'],
    ['staging.swap.cow.fi', 'https://staging.explorer.cow.fi'],
    ['dev.swap.cow.fi', 'https://dev.explorer.cow.fi'],
  ])('follows the widget on %s', (hostname, explorerBaseUrl) => {
    expect(getExplorerBaseUrl(location(hostname))).toBe(explorerBaseUrl)
  })

  it('is dev for a swap-dev preview', () => {
    process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL = SWAP_PREVIEW_URL

    expect(getExplorerBaseUrl(location(RWA_PREVIEW_HOST))).toBe('https://dev.explorer.cow.fi')
  })

  it.each([RWA_PREVIEW_HOST, 'swap.cow.fi.evil.com', undefined])(
    'is prod with the production widget on %s',
    (hostname) => {
      expect(getExplorerBaseUrl(hostname ? location(hostname) : undefined)).toBe('https://explorer.cow.fi')
    },
  )
})
