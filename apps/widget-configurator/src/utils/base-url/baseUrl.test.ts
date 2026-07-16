import { branchNameToVercelPreviewUrl, getEnvLabel } from './baseUrl'

describe('branchNameToVercelPreviewUrl', () => {
  it('matches Vercel swap preview URLs', () => {
    expect(branchNameToVercelPreviewUrl('release/2026-07-15')).toBe(
      'https://swap-dev-git-release-2026-07-15-cowswap-dev.vercel.app',
    )
    expect(branchNameToVercelPreviewUrl('feature/a-very-long-branch-name-that-exceeds-the-dns-label-limit')).toBe(
      'https://swap-dev-git-feature-a-very-long-branch-name-that-e-cowswap-dev.vercel.app',
    )
  })
})

describe('getEnvLabel', () => {
  it('recognizes only Vercel preview URLs', () => {
    expect(getEnvLabel('https://swap-dev-git-release-2026-07-15-cowswap-dev.vercel.app')).toBe('Preview')
    expect(getEnvLabel('https://release-2026-07-15.swap-dev-5u6.pages.dev')).toBe('Unknown')
  })
})
