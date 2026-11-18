import { captureError, ERROR_TYPES, isInsufficientFundsProviderError } from '@cowprotocol/common-utils'
import { OrderBookApiError, OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'

import { SolanaAppDataMismatchError } from './assertSignedAppData'
import { reportSolanaOrderError, ReportSolanaOrderErrorParams } from './reportSolanaOrderError'

jest.mock('@cowprotocol/common-utils', () => ({
  captureError: jest.fn(),
  createCowLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
  ERROR_TYPES: { ON_SWAP: 'onSwap', ON_APPROVE: 'onApprove' },
  isInsufficientFundsProviderError: jest.fn(() => false),
}))

jest.mock('common/utils/toKeccak256', () => ({ toKeccak256: () => '0xhash' }))

const captureErrorMock = captureError as jest.Mock
const isInsufficientFundsMock = isInsufficientFundsProviderError as jest.Mock

function lastCall(): [Error, ERROR_TYPES, Record<string, unknown>, Record<string, string>, string[]] {
  return captureErrorMock.mock.calls[0]
}

function report(params: Partial<ReportSolanaOrderErrorParams> = {}): boolean {
  return reportSolanaOrderError({
    error: new Error('Something went wrong'),
    chainId: SupportedChainId.SOLANA,
    orderClass: OrderClass.MARKET,
    phase: 'sign',
    attempt: 1,
    followsFailure: false,
    isSponsored: false,
    isRejection: false,
    isWindowExpiryFailure: false,
    swapErrorMessage: 'Something went wrong',
    ...params,
  })
}

describe('reportSolanaOrderError', () => {
  beforeEach(() => {
    captureErrorMock.mockReset()
    isInsufficientFundsMock.mockReturnValue(false)
  })

  it('groups wallets that word the same failure differently into one fingerprint', () => {
    report({ error: new Error('Phantom - RPC Error: Unexpected error') })
    const firstFingerprint = lastCall()[4]

    captureErrorMock.mockReset()
    report({ error: new Error('WalletSendTransactionError: failed to send') })

    expect(lastCall()[4]).toEqual(firstFingerprint)
    expect(firstFingerprint).toEqual(['SolanaOrder', 'unknown'])
  })

  it('reports under a single scope with a stable error name', () => {
    report()

    const [sentryError, errorType, , tags] = lastCall()
    expect(sentryError.name).toBe('SolanaOrderSubmissionError')
    expect(errorType).toBe(ERROR_TYPES.ON_SWAP)
    expect(tags.scope).toBe('SolanaOrder')
  })

  it('keeps the original error as the cause and its wording searchable', () => {
    const error = new Error('Solflare: user storage full')
    report({ error, swapErrorMessage: 'Shown to the user' })

    const [sentryError, , params] = lastCall()
    expect(sentryError.cause).toBe(error)
    expect(params).toMatchObject({ message: 'Solflare: user storage full', swapErrorMessage: 'Shown to the user' })
  })

  it('does not report a rejected wallet prompt', () => {
    expect(report({ isRejection: true })).toBe(false)
    expect(captureErrorMock).not.toHaveBeenCalled()
  })

  it('does not report a signing window that ran out', () => {
    expect(report({ isWindowExpiryFailure: true })).toBe(false)
    expect(captureErrorMock).not.toHaveBeenCalled()
  })

  it('classifies a missing-fee failure, whatever the wallet called it', () => {
    isInsufficientFundsMock.mockReturnValue(true)
    report({ error: new Error('Attempt to debit an account but found no record of a prior credit') })

    expect(lastCall()[3].reason).toBe('insufficient-funds')
  })

  it('classifies an order book refusal', () => {
    const error = new OrderBookApiError({ statusText: 'Bad Request' } as Response, {
      errorType: 'InsufficientAllowance',
      description: 'nope',
    })
    report({ error })

    expect(lastCall()[3].reason).toBe('order-book')
  })

  // Reported rather than swallowed: it is low volume and worth counting, and the reason keeps every
  // wallet wording of it in one issue.
  it('classifies a SquadsX extension that is not a proposer on the Squad', () => {
    report({ error: new Error('this extension is not an active proposer on the selected multisig') })

    expect(lastCall()[3].reason).toBe('squads-setup')
  })

  it('classifies a failure that carries program logs', () => {
    const error = Object.assign(new Error('Transaction simulation failed'), {
      logs: ['Program log: custom program error: 0x1'],
    })
    report({ error })

    const [, , params, tags] = lastCall()
    expect(tags.reason).toBe('program-error')
    expect(params.logs).toEqual(['Program log: custom program error: 0x1'])
  })

  it('carries the doc that failed to hash on an appData mismatch', () => {
    const error = new SolanaAppDataMismatchError('0xsigned', '{"version":"1.1.0"}')
    report({ error })

    const [, , params, tags] = lastCall()
    expect(tags.reason).toBe('app-data-mismatch')
    expect(params.fullAppData).toBe('{"version":"1.1.0"}')
  })

  it('tags whether the transaction had already left the client', () => {
    report({ phase: 'submit', isSponsored: true, orderClass: OrderClass.LIMIT })

    expect(lastCall()[3]).toMatchObject({
      phase: 'submit',
      submissionStarted: 'true',
      sponsored: 'true',
      orderClass: OrderClass.LIMIT,
    })
  })

  it.each(['plan', 'app-data-upload', 'sign'] as const)('treats %s as having placed nothing', (phase) => {
    report({ phase })

    expect(lastCall()[3].submissionStarted).toBe('false')
  })

  it('describes the cause chain of a wallet error that says nothing', () => {
    const inner = Object.assign(new Error(''), { name: 'WalletSignTransactionError', code: 4900 })
    const error = Object.assign(new Error('Unexpected error'), {
      name: 'WalletSendTransactionError',
      cause: inner,
    })
    report({ error })

    const [, , params, tags] = lastCall()
    expect(tags.errorName).toBe('WalletSendTransactionError')
    // Strings, not objects: Sentry's default context normalization would flatten objects this deep
    // into "[Object]".
    expect(params.errorChain).toEqual([
      'WalletSendTransactionError: Unexpected error',
      'WalletSignTransactionError [4900]: ',
    ])
    expect(params.errorKeys).toEqual(expect.arrayContaining(['name', 'cause']))
  })

  it('does not recurse forever through a self-referencing cause', () => {
    const error: Error & { cause?: unknown } = new Error('loop')
    error.cause = error
    report({ error })

    expect((lastCall()[2].errorChain as unknown[]).length).toBeLessThanOrEqual(5)
  })

  it('separates a failure after an earlier one, which is the signal that the client is stuck', () => {
    report({ attempt: 3, followsFailure: true })

    const [, , params, tags] = lastCall()
    expect(params.attempt).toBe(3)
    expect(tags.followsFailure).toBe('true')
  })

  it('does not treat a late attempt as stuck on its own', () => {
    report({ attempt: 3, followsFailure: false })

    expect(lastCall()[3].followsFailure).toBe('false')
  })
})
