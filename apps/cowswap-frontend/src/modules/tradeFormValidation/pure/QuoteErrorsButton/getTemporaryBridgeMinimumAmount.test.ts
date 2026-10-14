import { getTemporaryBridgeMinimumAmount } from './getTemporaryBridgeMinimumAmount.utils'

const body = {
  message: 'Temporary swap limits: minimum swap amount is $1,000',
  correlationId: '7ad29c65-2c84-4bdc-b642-b62a474b306d',
  timestamp: '2026-10-14T10:16:56.584Z',
  path: '/v0/quote',
}

function createContext(status: number, responseBody: unknown): object {
  return { context: Object.assign(new Error('Bad Request'), { status, body: responseBody }) }
}

describe('getTemporaryBridgeMinimumAmount', () => {
  it('recognizes the wrapped Near temporary minimum-amount response', () => {
    expect(getTemporaryBridgeMinimumAmount(createContext(400, body))).toBe('$1,000')
    expect(
      getTemporaryBridgeMinimumAmount(createContext(400, { ...body, message: body.message.replace('$1,000', '$500') })),
    ).toBe('$500')
  })

  it.each([429, 500, 503])('does not classify status %s as an amount restriction', (status) => {
    expect(getTemporaryBridgeMinimumAmount(createContext(status, body))).toBeNull()
  })

  it.each([
    'Invalid api key',
    'Internal Server Error',
    'Amount is too low',
    '',
    'Temporary swap limits: minimum swap amount is unknown',
    'Temporary swap limits: minimum swap amount is $1,000 extra text',
  ])('does not classify unrelated message %s as the temporary limit', (message) => {
    expect(getTemporaryBridgeMinimumAmount(createContext(400, { message }))).toBeNull()
  })

  it.each([null, undefined, {}, { context: null }, { context: { status: 400 } }, body])(
    'ignores missing or unexpected context (%p)',
    (context) => {
      expect(getTemporaryBridgeMinimumAmount(context)).toBeNull()
    },
  )
})
