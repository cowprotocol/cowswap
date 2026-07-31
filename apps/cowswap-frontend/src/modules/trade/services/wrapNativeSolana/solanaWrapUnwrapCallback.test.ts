/**
 * Program-address derivation needs a working ed25519 curve check, and `PublicKey.isOnCurve` misreports
 * every point as on-curve under jsdom — which makes `findProgramAddressSync` exhaust all 255 bumps.
 * @jest-environment node
 */
import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { Connection, Transaction } from '@solana/web3.js'

import { solanaWrapUnwrapCallback, SolanaWrapUnwrapContext } from './solanaWrapUnwrapCallback'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const ACCOUNT = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
const SIGNATURE = '5x8VXqZ8pQ2mJ7Yb1kL3nR4tW6uH9dF2sG5cA7eB1vN3mK4pQ8rT2yU6iO9aS1dF'
const BLOCKHASH = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi'
const LAST_VALID_BLOCK_HEIGHT = 1_234

const SOL = NATIVE_CURRENCIES[SupportedChainId.SOLANA]
const WSOL = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA]

interface Harness {
  context: SolanaWrapUnwrapContext
  sentTransactions: Transaction[]
  addTransaction: jest.Mock
  closeModals: jest.Mock
  openErrorModal: jest.Mock
  openTransactionConfirmationModal: jest.Mock
  getLatestBlockhash: jest.Mock
}

function createHarness({
  amount,
  wsolAccountExists = true,
  wsolBalance = '1000',
  rentExemptLamports = 9_000,
  sendErrors = [],
}: {
  amount: CurrencyAmount<typeof SOL>
  /** Whether the WSOL associated token account already exists — affects wrap's send amount. */
  wsolAccountExists?: boolean
  wsolBalance?: string
  rentExemptLamports?: number
  /** One rejection per call to `sendTransaction`, oldest first; calls past the array resolve normally. */
  sendErrors?: unknown[]
}): Harness {
  const sentTransactions: Transaction[] = []
  const getLatestBlockhash = jest
    .fn()
    .mockResolvedValue({ blockhash: BLOCKHASH, lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT })

  const connection = {
    getLatestBlockhash,
    getAccountInfo: jest.fn().mockResolvedValue(wsolAccountExists ? {} : null),
    getTokenAccountBalance: jest.fn().mockResolvedValue({ value: { amount: wsolBalance } }),
    getMinimumBalanceForRentExemption: jest.fn().mockResolvedValue(rentExemptLamports),
  } as unknown as Connection

  let sendCallCount = 0
  const provider = {
    sendTransaction: jest.fn(async (transaction: Transaction) => {
      const error = sendErrors[sendCallCount]
      sendCallCount++
      if (error) throw error

      sentTransactions.push(transaction)

      return SIGNATURE
    }),
  } as unknown as SolanaProvider

  const addTransaction = jest.fn()
  const closeModals = jest.fn()
  const openErrorModal = jest.fn()
  const openTransactionConfirmationModal = jest.fn()

  return {
    sentTransactions,
    addTransaction,
    closeModals,
    openErrorModal,
    openTransactionConfirmationModal,
    getLatestBlockhash,
    context: {
      account: ACCOUNT,
      amount,
      connection,
      provider,
      addTransaction,
      analytics: { sendEvent: jest.fn() } as unknown as SolanaWrapUnwrapContext['analytics'],
      closeModals,
      openErrorModal,
      openTransactionConfirmationModal,
    },
  }
}

describe('solanaWrapUnwrapCallback', () => {
  describe('wrapping SOL', () => {
    const amount = CurrencyAmount.fromRawAmount(SOL, 500n)

    it('sends a transaction that creates the account, funds it, and syncs it', async () => {
      const harness = createHarness({ amount })

      const result = await solanaWrapUnwrapCallback(harness.context)

      expect(result).toEqual({ hash: SIGNATURE })
      expect(harness.sentTransactions).toHaveLength(1)
      expect(harness.sentTransactions[0].instructions).toHaveLength(3)
    })

    it('pays the fee from the connected account and uses a fresh blockhash', async () => {
      const harness = createHarness({ amount })

      await solanaWrapUnwrapCallback(harness.context)

      const [transaction] = harness.sentTransactions
      expect(transaction.feePayer?.toBase58()).toBe(ACCOUNT)
      expect(transaction.recentBlockhash).toBe(BLOCKHASH)
    })

    it('records the transaction with the blockhash expiry so it can be finalized later', async () => {
      const harness = createHarness({ amount })

      await solanaWrapUnwrapCallback(harness.context)

      expect(harness.addTransaction).toHaveBeenCalledWith({
        hash: SIGNATURE,
        summary: 'Wrap 0.0000005 SOL to 0.0000005 WSOL',
        data: { lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT },
      })
      expect(harness.closeModals).toHaveBeenCalled()
    })

    it('shows the pending screen the exact WSOL amount that will land, 1:1 with what was typed, when the account already exists', async () => {
      const harness = createHarness({ amount, wsolAccountExists: true })

      await solanaWrapUnwrapCallback(harness.context)

      expect(harness.openTransactionConfirmationModal).toHaveBeenCalledWith({
        sendAmount: CurrencyAmount.fromRawAmount(SOL, 500n),
        receiveAmount: CurrencyAmount.fromRawAmount(WSOL, 500n),
      })
    })

    it('deducts the one-time rent-exempt deposit from the received WSOL when the account does not exist yet, spending exactly what was typed', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 10_000n),
        wsolAccountExists: false,
        rentExemptLamports: 9_000,
      })

      await solanaWrapUnwrapCallback(harness.context)

      // Spends exactly the 10_000 lamports typed; the 9000 lamport deposit needed to create the
      // associated token account comes out of that, leaving 1000 lamports of WSOL.
      expect(harness.openTransactionConfirmationModal).toHaveBeenCalledWith({
        sendAmount: CurrencyAmount.fromRawAmount(SOL, 10_000n),
        receiveAmount: CurrencyAmount.fromRawAmount(WSOL, 1_000n),
      })
      expect(harness.addTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Wrap 0.00001 SOL to 0.000001 WSOL' }),
      )
    })

    it('rejects wrapping an amount too small to cover a new account rent-exempt deposit', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 500n),
        wsolAccountExists: false,
        rentExemptLamports: 9_000,
      })

      const result = await solanaWrapUnwrapCallback(harness.context)

      expect(result).toBeNull()
      expect(harness.openErrorModal).toHaveBeenCalledWith(
        'Wrap amount is too small to cover the new account rent-exempt deposit',
      )
      expect(harness.context.provider.sendTransaction).not.toHaveBeenCalled()
    })
  })

  describe('unwrapping WSOL', () => {
    it('closes the account only, when unwrapping the entire balance', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(WSOL, 1000n),
        wsolBalance: '1000',
      })

      await solanaWrapUnwrapCallback(harness.context)

      expect(harness.sentTransactions[0].instructions).toHaveLength(1)
      expect(harness.addTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Unwrap 0.000001 WSOL to 0.00001 SOL' }),
      )
    })

    it('surfaces the reclaimed rent-exempt reserve on the pending screen before the transaction is sent', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(WSOL, 1000n),
        wsolBalance: '1000',
        rentExemptLamports: 9_000,
      })

      await solanaWrapUnwrapCallback(harness.context)

      // 1000 lamports typed + the 9000 lamport rent-exempt reserve the closed account refunds
      expect(harness.openTransactionConfirmationModal).toHaveBeenCalledWith({
        sendAmount: CurrencyAmount.fromRawAmount(WSOL, 1000n),
        receiveAmount: CurrencyAmount.fromRawAmount(SOL, 10_000n),
      })
    })

    it('re-wraps the remainder when unwrapping part of the balance', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(WSOL, 400n),
        wsolBalance: '1000',
      })

      await solanaWrapUnwrapCallback(harness.context)

      expect(harness.sentTransactions[0].instructions).toHaveLength(4)
    })

    it('does not add the rent-exempt reserve when a remainder stays wrapped', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(WSOL, 400n),
        wsolBalance: '1000',
        rentExemptLamports: 9_000,
      })

      await solanaWrapUnwrapCallback(harness.context)

      expect(harness.openTransactionConfirmationModal).toHaveBeenCalledWith({
        sendAmount: CurrencyAmount.fromRawAmount(WSOL, 400n),
        receiveAmount: CurrencyAmount.fromRawAmount(SOL, 400n),
      })
    })
  })

  describe('when the user rejects', () => {
    it('closes the modal without surfacing an error, without retrying', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 500n),
        sendErrors: [{ code: 4001, message: 'User rejected the request.' }],
      })

      const result = await solanaWrapUnwrapCallback(harness.context)

      expect(result).toBeNull()
      expect(harness.closeModals).toHaveBeenCalled()
      expect(harness.openErrorModal).not.toHaveBeenCalled()
      expect(harness.addTransaction).not.toHaveBeenCalled()
      expect(harness.context.provider.sendTransaction).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the blockhash expires before the wallet signs', () => {
    it('retries with a freshly fetched blockhash and succeeds', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 500n),
        sendErrors: [new Error('failed to send transaction: Blockhash not found')],
      })

      const result = await solanaWrapUnwrapCallback(harness.context)

      expect(result).toEqual({ hash: SIGNATURE })
      expect(harness.context.provider.sendTransaction).toHaveBeenCalledTimes(2)
      expect(harness.getLatestBlockhash).toHaveBeenCalledTimes(2)
      expect(harness.openErrorModal).not.toHaveBeenCalled()
    })

    it('gives up and surfaces the error after exhausting its retries', async () => {
      const persistentError = new Error('failed to send transaction: Blockhash not found')
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 500n),
        sendErrors: [persistentError, persistentError, persistentError],
      })

      const result = await solanaWrapUnwrapCallback(harness.context)

      expect(result).toBeNull()
      expect(harness.context.provider.sendTransaction).toHaveBeenCalledTimes(3)
      expect(harness.openErrorModal).toHaveBeenCalledWith(persistentError.message)
    })

    it('does not retry a failure unrelated to the blockhash', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 500n),
        sendErrors: [new Error('insufficient funds for rent')],
      })

      const result = await solanaWrapUnwrapCallback(harness.context)

      expect(result).toBeNull()
      expect(harness.context.provider.sendTransaction).toHaveBeenCalledTimes(1)
      expect(harness.openErrorModal).toHaveBeenCalledWith('insufficient funds for rent')
    })
  })

  describe('when the transaction fails for another reason', () => {
    it('shows the failure in the modal', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 500n),
        sendErrors: [new Error('Some other failure')],
      })

      const result = await solanaWrapUnwrapCallback(harness.context)

      expect(result).toBeNull()
      expect(harness.openErrorModal).toHaveBeenCalledWith('Some other failure')
    })

    it('rethrows instead of opening a modal when modals are disabled', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 500n),
        sendErrors: [new Error('Some other failure')],
      })

      await expect(solanaWrapUnwrapCallback(harness.context, { useModals: false })).rejects.toThrow(
        'Some other failure',
      )
      expect(harness.openErrorModal).not.toHaveBeenCalled()
      expect(harness.openTransactionConfirmationModal).not.toHaveBeenCalled()
    })
  })
})
