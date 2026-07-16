import { branchNameToVercelPreviewUrl, getEnvLabel } from './baseUrl'

describe('branchNameToVercelPreviewUrl', () => {
  it('matches Vercel swap preview URLs', () => {
    expect(branchNameToVercelPreviewUrl('release/2026-07-15')).toBe(
      'https://swap-dev-git-release-2026-07-15-cowswap-dev.vercel.app',
    )
    expect(branchNameToVercelPreviewUrl('test-----a/-branch')).toBe(
      'https://swap-dev-git-test-a-branch-cowswap-dev.vercel.app',
    )
    expect(branchNameToVercelPreviewUrl('test-----a-badna9878979/-long-andweird7896branchname')).toBeNull()
  })
})

describe('getEnvLabel', () => {
  it('recognizes only Vercel preview URLs', () => {
    expect(getEnvLabel('https://swap-dev-git-release-2026-07-15-cowswap-dev.vercel.app')).toBe('Preview')
    expect(getEnvLabel('https://release-2026-07-15.swap-dev-5u6.pages.dev')).toBe('Unknown')
  })
})
