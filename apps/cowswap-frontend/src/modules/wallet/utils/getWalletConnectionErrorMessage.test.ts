import { getWalletConnectionErrorMessage } from './getWalletConnectionErrorMessage'

describe('getWalletConnectionErrorMessage', () => {
  it('returns the provider message for structured wallet errors', () => {
    expect(
      getWalletConnectionErrorMessage({
        code: 4001,
        message: 'Request rejected',
        stack: 'very long stack trace',
      }),
    ).toBe('Request rejected')
  })

  it('extracts the nested message from a JSON error string', () => {
    expect(
      getWalletConnectionErrorMessage('{"code":4001,"message":"Request rejected","stack":"very long stack trace"}'),
    ).toBe('Request rejected')
  })

  it('falls back to the normalized error message', () => {
    expect(getWalletConnectionErrorMessage(new Error('Connection failed'))).toBe('Connection failed')
  })
})
