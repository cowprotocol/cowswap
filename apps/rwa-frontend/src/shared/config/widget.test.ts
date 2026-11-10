import { getRelatedSwapPreviewUrl } from './widget'

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
