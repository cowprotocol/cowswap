import { assertHttpsUrlString, getNullableParentOrigin, isHttpsUrlString } from './url.utils'

// Helpers — all use configurable: true so each test can freely override and afterEach can reset.

function setAncestorOrigins(origins: string[]): void {
  Object.defineProperty(window.location, 'ancestorOrigins', {
    get: () => ({ ...origins }),
    configurable: true,
  })
}

function setReferrer(referrer: string): void {
  Object.defineProperty(document, 'referrer', {
    get: () => referrer,
    configurable: true,
  })
}

function setParent(parent: unknown): void {
  Object.defineProperty(window, 'parent', {
    get: () => parent,
    configurable: true,
  })
}

afterEach(() => {
  setAncestorOrigins([])
  setReferrer('')
  setParent(window)
})

describe('isHttpsUrlString', () => {
  it('accepts https URLs', () => {
    expect(isHttpsUrlString('https://swap.cow.fi')).toBe(true)
    expect(isHttpsUrlString('https://example.com/path')).toBe(true)
  })

  it('accepts http on local dev hostnames', () => {
    expect(isHttpsUrlString('http://localhost:3000')).toBe(true)
    expect(isHttpsUrlString('http://127.0.0.1:8080')).toBe(true)
    expect(isHttpsUrlString('http://app.localhost:3000')).toBe(true)
    expect(isHttpsUrlString('http://[::1]:3000')).toBe(true)
  })

  it('rejects http on non-local hosts', () => {
    expect(isHttpsUrlString('http://evil.com')).toBe(false)
    expect(isHttpsUrlString('http://notlocalhost:3000')).toBe(false)
  })

  it('assertHttpsUrlString throws for disallowed http URLs', () => {
    expect(() => assertHttpsUrlString('http://evil.com')).toThrow(/not a valid HTTPS URL/i)
  })
})

describe('getNullableParentOrigin', () => {
  describe('ancestorOrigins (first priority)', () => {
    it('returns the first ancestor origin', () => {
      setAncestorOrigins(['https://parent.example'])
      expect(getNullableParentOrigin()).toBe('https://parent.example')
    })

    it('returns undefined when ancestorOrigins is empty', () => {
      setAncestorOrigins([])
      expect(getNullableParentOrigin()).toBeNull()
    })

    it('returns undefined when ancestor origin is the "null" string (opaque origin)', () => {
      setAncestorOrigins(['null'])
      expect(getNullableParentOrigin()).toBeNull()
    })
  })

  describe('document.referrer (second priority)', () => {
    it('returns the origin extracted from document.referrer', () => {
      setReferrer('https://referrer.example/some/page')
      expect(getNullableParentOrigin()).toBe('https://referrer.example')
    })

    it('returns undefined when referrer is an empty string', () => {
      setReferrer('')
      expect(getNullableParentOrigin()).toBeNull()
    })

    it('returns undefined when referrer is not a valid URL', () => {
      setReferrer('not-a-url')
      expect(getNullableParentOrigin()).toBeNull()
    })
  })

  describe('window.parent.location.origin (third priority)', () => {
    it('returns the parent origin when embedded in a different window', () => {
      setParent({ location: { origin: 'https://embedding.example' } })
      expect(getNullableParentOrigin()).toBe('https://embedding.example')
    })

    it('returns undefined when window.parent is the same window (top-level)', () => {
      setParent(window)
      expect(getNullableParentOrigin()).toBeNull()
    })

    it('returns undefined when accessing window.parent.location throws (cross-origin)', () => {
      setParent({
        get location(): never {
          throw new DOMException('Blocked a frame from accessing a cross-origin frame.')
        },
      })
      expect(getNullableParentOrigin()).toBeNull()
    })

    it('returns undefined when parent.location.origin is the "null" string', () => {
      setParent({ location: { origin: 'null' } })
      expect(getNullableParentOrigin()).toBeNull()
    })
  })

  describe('fallback chain', () => {
    it('returns undefined when all three strategies produce nothing', () => {
      setAncestorOrigins([])
      setReferrer('')
      setParent(window)
      expect(getNullableParentOrigin()).toBeNull()
    })

    it('prefers ancestorOrigins over referrer and parent', () => {
      setAncestorOrigins(['https://ancestor.example'])
      setReferrer('https://referrer.example/page')
      setParent({ location: { origin: 'https://parent.example' } })
      expect(getNullableParentOrigin()).toBe('https://ancestor.example')
    })

    it('falls through "null" ancestor origin to referrer', () => {
      setAncestorOrigins(['null'])
      setReferrer('https://referrer.example/page')
      expect(getNullableParentOrigin()).toBe('https://referrer.example')
    })

    it('falls through to parent when both ancestorOrigins and referrer are absent', () => {
      setAncestorOrigins([])
      setReferrer('')
      setParent({ location: { origin: 'https://parent.example' } })
      expect(getNullableParentOrigin()).toBe('https://parent.example')
    })

    it('prefers referrer over parent when no ancestor origins', () => {
      setAncestorOrigins([])
      setReferrer('https://referrer.example/page')
      setParent({ location: { origin: 'https://parent.example' } })
      expect(getNullableParentOrigin()).toBe('https://referrer.example')
    })
  })
})
