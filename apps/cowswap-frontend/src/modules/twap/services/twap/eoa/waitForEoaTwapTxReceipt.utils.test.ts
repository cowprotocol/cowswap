import type { Hex } from 'viem'
import type { Config } from 'wagmi'
import { getTransaction, getTransactionReceipt } from 'wagmi/actions'

import { delay } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { NOT_BROADCAST_GRACE_PERIOD_MS, TransactionNotBroadcastError } from 'common/hooks/useGetReceipt'

import { waitForEoaTwapTxReceipt } from './waitForEoaTwapTxReceipt.utils'

jest.mock('wagmi/actions', () => ({
  getTransaction: jest.fn(),
  getTransactionReceipt: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  delay: jest.fn(),
}))

const mockedGetTransaction = getTransaction as jest.MockedFunction<typeof getTransaction>
const mockedGetTransactionReceipt = getTransactionReceipt as jest.MockedFunction<typeof getTransactionReceipt>
const mockedDelay = delay as jest.MockedFunction<typeof delay>

const HASH = '0xabc' as Hex
const CONFIG = {} as Config
const SEPOLIA_GRACE_PERIOD_MS = NOT_BROADCAST_GRACE_PERIOD_MS[SupportedChainId.SEPOLIA]
const RECEIPT_POLL_MS = 2_000
const RECEIPT_TIMEOUT_MS = 180_000

const SUCCESS_RECEIPT = {
  status: 'success',
  blockNumber: 1n,
  transactionHash: HASH,
  logs: [],
} as never

function transactionNotFoundError(): Error {
  const error = new Error('Transaction not found')
  error.name = 'TransactionNotFoundError'
  return error
}

describe('waitForEoaTwapTxReceipt()', () => {
  let now = 0

  beforeEach(() => {
    now = 0
    jest.spyOn(Date, 'now').mockImplementation(() => now)
    mockedDelay.mockImplementation(async (ms = 0) => {
      now += ms
    })
    mockedGetTransaction.mockReset()
    mockedGetTransactionReceipt.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns the receipt when it is already available', async () => {
    mockedGetTransactionReceipt.mockResolvedValue(SUCCESS_RECEIPT)

    await expect(waitForEoaTwapTxReceipt(CONFIG, HASH, SupportedChainId.SEPOLIA)).resolves.toBe(SUCCESS_RECEIPT)
    expect(mockedGetTransaction).not.toHaveBeenCalled()
  })

  it('returns the receipt after polling while the tx is in the mempool', async () => {
    mockedGetTransactionReceipt
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(SUCCESS_RECEIPT)
    mockedGetTransaction.mockResolvedValue({ hash: HASH } as never)

    await expect(waitForEoaTwapTxReceipt(CONFIG, HASH, SupportedChainId.SEPOLIA)).resolves.toBe(SUCCESS_RECEIPT)
    expect(mockedDelay).toHaveBeenCalledTimes(2)
  })

  it('throws TransactionNotBroadcastError after the STX grace period when the hash never appears', async () => {
    mockedGetTransactionReceipt.mockResolvedValue(null as never)
    mockedGetTransaction.mockRejectedValue(transactionNotFoundError())

    await expect(waitForEoaTwapTxReceipt(CONFIG, HASH, SupportedChainId.SEPOLIA)).rejects.toBeInstanceOf(
      TransactionNotBroadcastError,
    )
    expect(now).toBeGreaterThanOrEqual(SEPOLIA_GRACE_PERIOD_MS)
    expect(now).toBeLessThan(RECEIPT_TIMEOUT_MS)
  })

  it('keeps polling through transient RPC errors instead of treating them as not-broadcast', async () => {
    mockedGetTransactionReceipt
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(SUCCESS_RECEIPT)
    mockedGetTransaction.mockRejectedValueOnce(new Error('429')).mockResolvedValueOnce({ hash: HASH } as never)

    await expect(waitForEoaTwapTxReceipt(CONFIG, HASH, SupportedChainId.SEPOLIA)).resolves.toBe(SUCCESS_RECEIPT)
  })

  it('times out if the tx exists but a receipt never arrives', async () => {
    mockedGetTransactionReceipt.mockResolvedValue(null as never)
    mockedGetTransaction.mockResolvedValue({ hash: HASH } as never)

    await expect(waitForEoaTwapTxReceipt(CONFIG, HASH, SupportedChainId.SEPOLIA)).rejects.toThrow(
      'Timed out waiting for the transaction. Please try again.',
    )
    expect(now).toBeGreaterThanOrEqual(RECEIPT_TIMEOUT_MS)
    expect(mockedDelay).toHaveBeenCalledWith(RECEIPT_POLL_MS)
  })
})
