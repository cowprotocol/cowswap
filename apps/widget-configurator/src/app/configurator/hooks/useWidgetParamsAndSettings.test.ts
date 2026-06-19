import { branchNameToCfPagesSubdomain, vercelPreviewSlugToCfPagesSubdomain } from './useWidgetParamsAndSettings'

describe('branchNameToCfPagesSubdomain', () => {
  it('matches Cloudflare Pages preview subdomains', () => {
    expect(branchNameToCfPagesSubdomain('cf-preview/pr-7657')).toBe('cf-preview-pr-7657')
    expect(branchNameToCfPagesSubdomain('Feature/API_fix')).toBe('feature-api-fix')
    expect(branchNameToCfPagesSubdomain('fix/deepsec-high-frontend-hardening')).toBe('fix-deepsec-high-frontend-ha')
    expect(branchNameToCfPagesSubdomain('test-----a-badna9878979/-long-andweird7896branchname')).toBe(
      'test-----a-badna9878979--lon',
    )
    expect(branchNameToCfPagesSubdomain('test--branch--wierd/--')).toBe('test--branch--wierd')
    expect(branchNameToCfPagesSubdomain('/feature/')).toBe('feature')
    expect(branchNameToCfPagesSubdomain('---')).toBe('preview')
  })
})

describe('vercelPreviewSlugToCfPagesSubdomain', () => {
  it('maps visible Vercel preview slugs to Cloudflare Pages aliases', () => {
    expect(vercelPreviewSlugToCfPagesSubdomain('fix-permit-flow')).toBe('fix-permit-flow')
    expect(vercelPreviewSlugToCfPagesSubdomain('fix-deepsec-high-fro-87dcc4')).toBe('fix-deepsec-high-fro')
    expect(
      vercelPreviewSlugToCfPagesSubdomain('fix-deepsec-high-fro-87dcc4', 'fix/deepsec-high-frontend-hardening'),
    ).toBe('fix-deepsec-high-frontend-ha')
  })
})
