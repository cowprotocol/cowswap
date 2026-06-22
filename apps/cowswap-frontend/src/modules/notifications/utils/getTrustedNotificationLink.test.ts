import { getTrustedNotificationLink } from './getTrustedNotificationLink'

describe('getTrustedNotificationLink', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/trade')
  })

  it('accepts same-origin relative paths', () => {
    expect(getTrustedNotificationLink('/learn/more')).toEqual({
      href: '/learn/more',
      target: '_parent',
    })
  })

  it('accepts same-origin absolute URLs as internal links', () => {
    const sameOriginUrl = `${window.location.origin}/learn/more`

    expect(getTrustedNotificationLink(sameOriginUrl)).toEqual({
      href: sameOriginUrl,
      target: '_parent',
    })
  })

  it('opens external https URLs in a new tab with noopener', () => {
    expect(getTrustedNotificationLink('https://example.com/path')).toEqual({
      href: 'https://example.com/path',
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })

  it('rejects external http URLs', () => {
    expect(getTrustedNotificationLink('http://example.com/path')).toBeNull()
  })

  it('rejects protocol-relative URLs', () => {
    expect(getTrustedNotificationLink('//example.com/path')).toBeNull()
  })

  it('rejects executable URL schemes', () => {
    expect(getTrustedNotificationLink('javascript:alert(1)')).toBeNull()
  })
})
