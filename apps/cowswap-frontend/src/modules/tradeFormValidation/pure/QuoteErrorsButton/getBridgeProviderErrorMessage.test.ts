import { getBridgeProviderErrorMessage } from './getBridgeProviderErrorMessage'

function createOneClickApiError(message: string): Error {
  return Object.assign(new Error('Bad Request'), {
    status: 400,
    url: 'https://1click.chaindefuser.com/v0/quote',
    body: {
      message,
      correlationId: 'b27e44c1-340c-4418-b005-8db7851d9a52',
      timestamp: '2026-09-11T15:42:42.627Z',
      path: '/v0/quote',
    },
  })
}

describe('getBridgeProviderErrorMessage', () => {
  it('should find the message of a provider error wrapped by fetchAndProcessQuote', () => {
    const context = { context: createOneClickApiError('Temporary swap limits: minimum swap amount is $1,000') }

    expect(getBridgeProviderErrorMessage(context)).toBe('Temporary swap limits: minimum swap amount is $1,000')
  })

  it('should find the message of a response body passed as the context directly', () => {
    expect(getBridgeProviderErrorMessage({ message: 'Amount is too low' })).toBe('Amount is too low')
  })

  it('should find the original message of a Near Intents minimum-amount error', () => {
    const context = { originalMessage: 'Amount is too low. Try at least 1000', minAmount: '1000' }

    expect(getBridgeProviderErrorMessage(context)).toBe('Amount is too low. Try at least 1000')
  })

  it('should find the message nested under errorBody', () => {
    expect(getBridgeProviderErrorMessage({ errorBody: { message: 'No route found' }, type: 'quote' })).toBe(
      'No route found',
    )
  })

  it('should ignore the message of an Error, which only holds the HTTP status text', () => {
    expect(getBridgeProviderErrorMessage({ context: new Error('Bad Request') })).toBeNull()
  })

  it.each([null, undefined, 'some error', 42, {}, { context: {} }])(
    'should return null when there is no message to show (%p)',
    (context) => {
      expect(getBridgeProviderErrorMessage(context)).toBeNull()
    },
  )

  it('should ignore a message that is only whitespace', () => {
    expect(getBridgeProviderErrorMessage({ message: '   ' })).toBeNull()
  })

  it('should truncate a message too long for the trade button', () => {
    const result = getBridgeProviderErrorMessage({ message: 'a'.repeat(250) })

    expect(result).toBe(`${'a'.repeat(100)}…`)
  })

  it('should not recurse forever on a self-referencing context', () => {
    const context: Record<string, unknown> = {}
    context.context = context

    expect(getBridgeProviderErrorMessage(context)).toBeNull()
  })
})
