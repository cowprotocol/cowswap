import { isReactError310 } from './React310RecoveryErrorBoundary.container'

describe('isReactError310', () => {
  it('detects minified production message', () => {
    expect(
      isReactError310(
        new Error(
          'Minified React error #310; visit https://react.dev/errors/310 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.',
        ),
      ),
    ).toBe(true)
  })

  it('detects hooks rule message in development', () => {
    expect(isReactError310(new Error('Rendered more hooks than during the previous render'))).toBe(true)
  })

  it('detects alternate React error #310 wording', () => {
    expect(isReactError310(new Error('React error #310'))).toBe(true)
  })

  it('returns false for unrelated errors', () => {
    expect(isReactError310(new Error('Network failed'))).toBe(false)
    expect(isReactError310(null)).toBe(false)
    expect(isReactError310('string')).toBe(false)
  })
})
