import { getNullableParentOrigin, UrlString } from '@cowprotocol/iframe-transport'

import { getIsSafeAppIframe } from './getIsSafeAppIframe'

jest.mock('@cowprotocol/iframe-transport', () => ({
  getNullableParentOrigin: jest.fn(),
}))

const getNullableParentOriginMock = getNullableParentOrigin as jest.MockedFunction<typeof getNullableParentOrigin>

const supportedOrigins = [
  'https://app.safe.global',
  'https://safe-wallet-monorepo-cowswap-web.vercel.app',
  'https://safe-wallet-web.dev.5afe.dev',
  'https://safe-wallet-web.staging.5afe.dev',
  'https://pr-123.review.5afe.dev',
  'http://localhost:4003',
] as const satisfies readonly UrlString[]

const unsupportedOrigins = [
  null,
  'http://localhost:3000',
  'https://review.5afe.dev',
  'http://pr-123.review.5afe.dev',
  'https://pr-123.review.5afe.dev:444',
  'https://pr-123.review.5afe.dev.evil.com',
  'https://evil-pr-123-review-5afe.dev',
] as const satisfies readonly (UrlString | null)[]

describe('getIsSafeAppIframe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each(supportedOrigins)('returns true for supported Safe parent origin %s', (origin) => {
    getNullableParentOriginMock.mockReturnValue(origin)

    expect(getIsSafeAppIframe()).toBe(true)
  })

  it.each(unsupportedOrigins)('returns false for unsupported parent origin %s', (origin) => {
    getNullableParentOriginMock.mockReturnValue(origin)

    expect(getIsSafeAppIframe()).toBe(false)
  })
})
