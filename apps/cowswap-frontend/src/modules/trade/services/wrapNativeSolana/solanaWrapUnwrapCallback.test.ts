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

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana'

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
}

function createHarness({
  amount,
  wsolBalance = '1000',
  sendError,
}: {
  amount: CurrencyAmount<typeof SOL>
  wsolBalance?: string
  sendError?: unknown
}): Harness {
  const sentTransactions: Transaction[] = []

  const connection = {
    getLatestBlockhash: jest
      .fn()
      .mockResolvedValue({ blockhash: BLOCKHASH, lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT }),
    getTokenAccountBalance: jest.fn().mockResolvedValue({ value: { amount: wsolBalance } }),
  } as unknown as Connection

  const provider = {
    sendTransaction: jest.fn(async (transaction: Transaction) => {
      if (sendError) throw sendError
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
        summary: 'Wrap 0.0000005 SOL to WSOL',
        data: { lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT },
      })
      expect(harness.closeModals).toHaveBeenCalled()
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
        expect.objectContaining({ summary: 'Unwrap 0.000001 WSOL to SOL' }),
      )
    })

    it('re-wraps the remainder when unwrapping part of the balance', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(WSOL, 400n),
        wsolBalance: '1000',
      })

      await solanaWrapUnwrapCallback(harness.context)

      expect(harness.sentTransactions[0].instructions).toHaveLength(4)
    })
  })

  describe('when the user rejects', () => {
    it('closes the modal without surfacing an error', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 500n),
        sendError: { code: 4001, message: 'User rejected the request.' },
      })

      const result = await solanaWrapUnwrapCallback(harness.context)

      expect(result).toBeNull()
      expect(harness.closeModals).toHaveBeenCalled()
      expect(harness.openErrorModal).not.toHaveBeenCalled()
      expect(harness.addTransaction).not.toHaveBeenCalled()
    })
  })

  describe('when the transaction fails', () => {
    it('shows the failure in the modal', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 500n),
        sendError: new Error('Blockhash not found'),
      })

      const result = await solanaWrapUnwrapCallback(harness.context)

      expect(result).toBeNull()
      expect(harness.openErrorModal).toHaveBeenCalledWith('Blockhash not found')
    })

    it('rethrows instead of opening a modal when modals are disabled', async () => {
      const harness = createHarness({
        amount: CurrencyAmount.fromRawAmount(SOL, 500n),
        sendError: new Error('Blockhash not found'),
      })

      await expect(solanaWrapUnwrapCallback(harness.context, { useModals: false })).rejects.toThrow(
        'Blockhash not found',
      )
      expect(harness.openErrorModal).not.toHaveBeenCalled()
      expect(harness.openTransactionConfirmationModal).not.toHaveBeenCalled()
    })
  })
})
