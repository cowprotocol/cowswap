import { ApiErrorCodes, OperatorError } from './OperatorError'

describe('OperatorError', () => {
  it('uses our copy when the error code has one', () => {
    const error = new OperatorError({ errorType: ApiErrorCodes.InsufficientBalance, description: 'raw backend text' })

    expect(error.message).toBe("The account doesn't have enough funds.")
  })

  it('falls back to the backend description when our copy is just the code name', () => {
    const error = new OperatorError({ errorType: ApiErrorCodes.InvalidAppData, description: 'app data is malformed' })

    expect(error.message).toBe('app data is malformed')
  })

  it('falls back to the backend description for a code this enum does not know', () => {
    const error = new OperatorError({
      errorType: 'InvalidTransaction' as ApiErrorCodes,
      description: 'a preparation step names a token program that does not own its mint',
    })

    expect(error.message).toBe('a preparation step names a token program that does not own its mint')
  })
})
