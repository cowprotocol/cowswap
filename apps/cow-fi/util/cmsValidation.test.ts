import {
  CMS_REVALIDATE_TAG,
  isAllowedRevalidatePath,
  isValidCmsSlug,
  normalizeRevalidateRequest,
  normalizeSearchArticlesInput,
} from './cmsValidation'

describe('cmsValidation', () => {
  describe('isValidCmsSlug', () => {
    it('accepts canonical lowercase hyphenated slugs', () => {
      expect(isValidCmsSlug('aave-trade-breakdown')).toBe(true)
      expect(isValidCmsSlug('ens')).toBe(true)
    })

    it('rejects malformed or delimiter-based slugs', () => {
      expect(isValidCmsSlug('')).toBe(false)
      expect(isValidCmsSlug('Aave')).toBe(false)
      expect(isValidCmsSlug('../preview')).toBe(false)
      expect(isValidCmsSlug('aave&publicationState=preview')).toBe(false)
    })
  })

  describe('normalizeSearchArticlesInput', () => {
    it('trims valid input and clamps pagination to safe limits', () => {
      expect(
        normalizeSearchArticlesInput({
          searchTerm: '  cowswap  ',
          page: 500,
          pageSize: 1_000,
        }),
      ).toEqual({
        searchTerm: 'cowswap',
        page: 100,
        pageSize: 100,
      })
    })

    it('returns an empty search safely', () => {
      expect(
        normalizeSearchArticlesInput({
          searchTerm: '   ',
        }),
      ).toEqual({
        searchTerm: '',
        page: 0,
        pageSize: 10,
      })
    })

    it('rejects invalid pagination even for blank searches', () => {
      expect(() => normalizeSearchArticlesInput({ searchTerm: '   ', page: -1 })).toThrow(
        'Pagination parameters must be non-negative integers',
      )
      expect(() => normalizeSearchArticlesInput({ searchTerm: '   ', page: 'oops' })).toThrow(
        'Pagination parameters must be non-negative integers',
      )
    })

    it('rejects invalid search payloads', () => {
      expect(() => normalizeSearchArticlesInput('cowswap')).toThrow('Search input must be an object')
      expect(() => normalizeSearchArticlesInput({ searchTerm: 1 })).toThrow('Search term must be a string')
      expect(() => normalizeSearchArticlesInput({ searchTerm: 'cow', page: -1 })).toThrow(
        'Pagination parameters must be non-negative integers',
      )
      expect(() => normalizeSearchArticlesInput({ searchTerm: 'a'.repeat(101) })).toThrow(
        'Search term must be at most 100 characters',
      )
    })
  })

  describe('revalidation allowlist', () => {
    it('accepts approved learn paths', () => {
      expect(isAllowedRevalidatePath('/learn')).toBe(true)
      expect(isAllowedRevalidatePath('/learn/articles')).toBe(true)
      expect(isAllowedRevalidatePath('/learn/articles/2')).toBe(true)
      expect(isAllowedRevalidatePath('/learn/topic/amm')).toBe(true)
      expect(isAllowedRevalidatePath('/learn/aave-trade-breakdown')).toBe(true)
    })

    it('accepts exact resource hub, campaign, and detail paths', () => {
      expect(isAllowedRevalidatePath('/resources')).toBe(true)
      expect(isAllowedRevalidatePath('/resources/tokens')).toBe(true)
      expect(isAllowedRevalidatePath('/resources/tokens/example')).toBe(true)
      expect(isAllowedRevalidatePath('/resources/intent-hooks/hook-guide')).toBe(true)
      expect(isAllowedRevalidatePath('/resources/constructor/example')).toBe(true)
    })

    it('rejects paths outside the learn and resources allowlists', () => {
      expect(isAllowedRevalidatePath('/')).toBe(false)
      expect(isAllowedRevalidatePath('/api/revalidate')).toBe(false)
      expect(isAllowedRevalidatePath('/admin')).toBe(false)
      expect(isAllowedRevalidatePath('/learn//double-slash')).toBe(false)
      expect(isAllowedRevalidatePath('/learn/topic/Bad-Slug')).toBe(false)
      expect(isAllowedRevalidatePath('/resources/')).toBe(false)
      expect(isAllowedRevalidatePath('/resources/Tokens')).toBe(false)
      expect(isAllowedRevalidatePath('/resources/tokens/example/extra')).toBe(false)
      expect(isAllowedRevalidatePath('/resources/../admin')).toBe(false)
      expect(isAllowedRevalidatePath('/resources/tokens/../../admin')).toBe(false)
      expect(isAllowedRevalidatePath('/resources/[campaign]/[slug]')).toBe(false)
    })

    it('normalizes and validates revalidation payloads', () => {
      expect(
        normalizeRevalidateRequest({
          tag: CMS_REVALIDATE_TAG,
          path: 'learn/topic/amm',
        }),
      ).toEqual({
        tag: CMS_REVALIDATE_TAG,
        path: '/learn/topic/amm',
      })
      expect(
        normalizeRevalidateRequest({
          tag: CMS_REVALIDATE_TAG,
          path: 'resources/tokens/example',
        }),
      ).toEqual({
        tag: CMS_REVALIDATE_TAG,
        path: '/resources/tokens/example',
      })
    })

    it('rejects invalid revalidation payloads', () => {
      expect(() => normalizeRevalidateRequest(null)).toThrow('Revalidation body must be an object')
      expect(() => normalizeRevalidateRequest([])).toThrow('Revalidation body must be an object')
      expect(() => normalizeRevalidateRequest(new Date())).toThrow('Revalidation body must be an object')
      expect(() => normalizeRevalidateRequest({ tag: 'preview' })).toThrow('Unsupported revalidation tag "preview"')
      expect(() => normalizeRevalidateRequest({ tag: CMS_REVALIDATE_TAG, path: '/admin' })).toThrow(
        'Unsupported revalidation path "/admin"',
      )
      expect(() =>
        normalizeRevalidateRequest({ tag: CMS_REVALIDATE_TAG, path: '/resources/tokens/example/extra' }),
      ).toThrow('Unsupported revalidation path "/resources/tokens/example/extra"')
    })
  })
})
