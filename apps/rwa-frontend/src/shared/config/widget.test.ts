import { getRelatedSwapPreviewUrl, getWidgetBaseUrl } from './widget'

describe('getRelatedSwapPreviewUrl', () => {
  it('uses the swap-dev branch URL', () => {
    const relatedProjects = JSON.stringify([
      { project: { name: 'swap-dev' }, preview: { branch: 'swap-dev-git-feat-rwa-cowswap-dev.vercel.app' } },
    ])

    expect(getRelatedSwapPreviewUrl(relatedProjects)).toBe('https://swap-dev-git-feat-rwa-cowswap-dev.vercel.app')
  })

  it('is null without a swap-dev preview or with invalid data', () => {
    expect(getRelatedSwapPreviewUrl(undefined)).toBeNull()
    expect(getRelatedSwapPreviewUrl(JSON.stringify([{ project: { name: 'swap-dev' }, preview: {} }]))).toBeNull()
    expect(getRelatedSwapPreviewUrl('not json')).toBeNull()
  })
})

describe('getWidgetBaseUrl', () => {
  const location = (hostname: string): Pick<Location, 'hostname' | 'origin'> => ({
    hostname,
    origin: `https://${hostname}`,
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL
  })

  it.each(['swap.cow.fi', 'staging.swap.cow.fi', 'dev.swap.cow.fi'])('uses the CoW Swap of %s', (hostname) => {
    expect(getWidgetBaseUrl(location(hostname))).toBe(`https://${hostname}`)
  })

  it('uses the swap-dev preview outside CoW Swap hosts', () => {
    process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL = 'https://swap-dev-git-feat-cowswap-dev.vercel.app'

    expect(getWidgetBaseUrl(location('rwa-git-feat-cowswap-dev.vercel.app'))).toBe(
      'https://swap-dev-git-feat-cowswap-dev.vercel.app',
    )
  })

  it('falls back to the production widget', () => {
    expect(getWidgetBaseUrl(location('swap.cow.fi.evil.com'))).toBeUndefined()
    expect(getWidgetBaseUrl(location('evilswap.cow.fi'))).toBeUndefined()
    expect(getWidgetBaseUrl(undefined)).toBeUndefined()
  })
})
