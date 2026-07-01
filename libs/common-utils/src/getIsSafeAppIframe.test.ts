import { getIsSafeAppIframe } from './getIsSafeAppIframe'
import { getParentOrigin } from './getParentOrigin'

jest.mock('./getParentOrigin', () => ({
  getParentOrigin: jest.fn(),
}))

const getParentOriginMock = getParentOrigin as jest.MockedFunction<typeof getParentOrigin>

describe('getIsSafeAppIframe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    ['https://app.safe.global'],
    ['https://safe-wallet-monorepo-cowswap-web.vercel.app'],
    ['https://safe-wallet-web.dev.5afe.dev'],
    ['https://safe-wallet-web.staging.5afe.dev'],
    ['https://pr-123.review.5afe.dev'],
    ['http://localhost:4003'],
    ['http://localhost:3000'],
  ])('returns true for supported Safe parent origin %s', (origin) => {
    getParentOriginMock.mockReturnValue(origin)

    expect(getIsSafeAppIframe()).toBe(true)
  })

  it.each([
    undefined,
    'https://review.5afe.dev',
    'http://pr-123.review.5afe.dev',
    'https://pr-123.review.5afe.dev:444',
    'https://pr-123.review.5afe.dev.evil.com',
    'https://evil-pr-123-review-5afe.dev',
  ])('returns false for unsupported parent origin %s', (origin) => {
    getParentOriginMock.mockReturnValue(origin)

    expect(getIsSafeAppIframe()).toBe(false)
  })
})
