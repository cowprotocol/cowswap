import { getSafeAbsoluteUrl, getSafeSameOriginOrAbsoluteUrl } from './safeLink'

describe('safeLink', () => {
  describe('getSafeAbsoluteUrl', () => {
    it('accepts https urls', () => {
      expect(getSafeAbsoluteUrl('https://cow.fi/learn')).toBe('https://cow.fi/learn')
    })

    it('rejects unsafe schemes', () => {
      expect(getSafeAbsoluteUrl('javascript:alert(1)')).toBeNull()
      expect(getSafeAbsoluteUrl('data:text/html,boom')).toBeNull()
      expect(getSafeAbsoluteUrl('blob:https://cow.fi/id')).toBeNull()
    })

    it('rejects urls with credentials', () => {
      expect(getSafeAbsoluteUrl('https://user:pass@cow.fi/learn')).toBeNull()
    })
  })

  describe('getSafeSameOriginOrAbsoluteUrl', () => {
    const currentOrigin = 'https://swap.cow.fi'

    it('accepts same-origin relative urls', () => {
      expect(getSafeSameOriginOrAbsoluteUrl('/learn/article', currentOrigin)).toEqual({
        href: '/learn/article',
        isExternal: false,
      })
    })

    it('accepts external https urls', () => {
      expect(getSafeSameOriginOrAbsoluteUrl('https://cow.fi/learn', currentOrigin)).toEqual({
        href: 'https://cow.fi/learn',
        isExternal: true,
      })
    })

    it('rejects protocol-relative and unsafe urls', () => {
      expect(getSafeSameOriginOrAbsoluteUrl('//attacker.example', currentOrigin)).toBeNull()
      expect(getSafeSameOriginOrAbsoluteUrl('javascript:alert(1)', currentOrigin)).toBeNull()
    })
  })
})
