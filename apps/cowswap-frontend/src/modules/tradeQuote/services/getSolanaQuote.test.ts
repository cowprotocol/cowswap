jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  SolanaTradingSdk: jest.fn(),
}))

jest.mock('modules/trade/services/solanaSend/sendSolanaTransaction', () => ({
  sendSolanaTransaction: jest.fn(),
}))

import { OrderKind, QuoteAndPost, QuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

import { PublicKey, TransactionInstruction, Connection } from '@solana/web3.js'

import { sendSolanaTransaction } from 'modules/trade/services/solanaSend/sendSolanaTransaction'

import { getSolanaQuote } from './getSolanaQuote'

import { SolanaSigningContext } from '../types'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

const MockedSolanaTradingSdk = SolanaTradingSdk as jest.MockedClass<typeof SolanaTradingSdk>
const mockSendSolanaTransaction = sendSolanaTransaction as jest.MockedFunction<typeof sendSolanaTransaction>

const owner = new PublicKey(new Uint8Array(32).fill(9))
const sellMint = new PublicKey(new Uint8Array(32).fill(1))
const buyMint = new PublicKey(new Uint8Array(32).fill(2))

const quoteParams: QuoteBridgeRequest = {
  kind: OrderKind.SELL,
  amount: 1_000_000_000n,
  owner: owner.toBase58() as `0x${string}`,
  sellTokenChainId: SupportedChainId.SOLANA,
  sellTokenAddress: sellMint.toBase58(),
  sellTokenDecimals: 6,
  buyTokenChainId: SupportedChainId.SOLANA,
  buyTokenAddress: buyMint.toBase58(),
  buyTokenDecimals: 9,
  account: owner.toBase58() as `0x${string}`,
  appCode: 'test',
  signer: {} as never,
  receiver: null,
  validFor: 1800,
}

/** `getSolanaQuote` is a thin delegation to `SolanaTradingSdk.getQuote` — this is a stand-in for
 * whatever `QuoteAndPost` the SDK resolves with; the tests below only care that it's passed through
 * unchanged, not its internal shape. */
const mockQuoteAndPost = { quoteResults: {} as QuoteResults, postSwapOrderFromQuote: jest.fn() } as QuoteAndPost

/** Wires the mocked `SolanaTradingSdk` constructor so `new SolanaTradingSdk(...)` returns an object whose
 * `getQuote` is `mockGetQuote`, and captures the constructor's `signAndSend` option for assertions. */
function mockSolanaTradingSdk(mockGetQuote: jest.Mock): void {
  MockedSolanaTradingSdk.mockImplementation(() => ({ getQuote: mockGetQuote }) as unknown as SolanaTradingSdk)
}

describe('getSolanaQuote', () => {
  beforeEach(() => {
    MockedSolanaTradingSdk.mockReset()
    mockSendSolanaTransaction.mockReset()
  })

  it('maps quoteParams onto SolanaQuoteParameters and returns the SDK result unchanged', async () => {
    const mockGetQuote = jest.fn().mockResolvedValue(mockQuoteAndPost)
    mockSolanaTradingSdk(mockGetQuote)

    const result = await getSolanaQuote(quoteParams)

    expect(result).toBe(mockQuoteAndPost)
    expect(mockGetQuote).toHaveBeenCalledWith({
      ownerAddress: quoteParams.owner,
      sellTokenAddress: quoteParams.sellTokenAddress,
      buyTokenAddress: quoteParams.buyTokenAddress,
      receiverAddress: quoteParams.account,
      sellTokenDecimals: quoteParams.sellTokenDecimals,
      buyTokenDecimals: quoteParams.buyTokenDecimals,
      amount: quoteParams.amount,
      kind: quoteParams.kind,
      validForSeconds: quoteParams.validFor,
    })
  })

  it('falls back ownerAddress/receiverAddress to account when owner/receiver are not set', async () => {
    const mockGetQuote = jest.fn().mockResolvedValue(mockQuoteAndPost)
    mockSolanaTradingSdk(mockGetQuote)

    const paramsWithoutOwnerOrReceiver: QuoteBridgeRequest = {
      ...quoteParams,
      owner: undefined,
      receiver: null,
    }

    await getSolanaQuote(paramsWithoutOwnerOrReceiver)

    expect(mockGetQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerAddress: quoteParams.account,
        receiverAddress: quoteParams.account,
      }),
    )
  })

  it('propagates a rejection from the SDK', async () => {
    const mockGetQuote = jest.fn().mockRejectedValue(new Error('no route found'))
    mockSolanaTradingSdk(mockGetQuote)

    await expect(getSolanaQuote(quoteParams)).rejects.toThrow('no route found')
  })
})

describe('getSolanaQuote signAndSend', () => {
  beforeEach(() => {
    MockedSolanaTradingSdk.mockReset()
    mockSendSolanaTransaction.mockReset()
    mockSolanaTradingSdk(jest.fn().mockResolvedValue(mockQuoteAndPost))
  })

  it('rejects when no Solana wallet is connected', async () => {
    await getSolanaQuote(quoteParams, undefined)

    // The disconnected-wallet guard lives in the `signAndSend` passed to the `SolanaTradingSdk`
    // constructor (rather than a check inside `getSolanaQuote` itself) — verify it directly.
    const signAndSend = MockedSolanaTradingSdk.mock.calls[0][0].signAndSend
    await expect(signAndSend({} as TransactionInstruction)).rejects.toThrow('Solana wallet not connected')
    expect(mockSendSolanaTransaction).not.toHaveBeenCalled()
  })

  it('signs and sends through the connected wallet when a signing context is provided', async () => {
    const signingContext: SolanaSigningContext = {
      owner,
      provider: {} as SolanaProvider,
      connection: {} as Connection,
    }

    await getSolanaQuote(quoteParams, signingContext)

    const signAndSend = MockedSolanaTradingSdk.mock.calls[0][0].signAndSend
    mockSendSolanaTransaction.mockResolvedValue({ hash: 'tx-hash-abc', lastValidBlockHeight: 123 })

    const fakeInstruction = {} as TransactionInstruction
    const signAndSendResult = await signAndSend(fakeInstruction)

    expect(mockSendSolanaTransaction).toHaveBeenCalledWith(
      signingContext.connection,
      signingContext.provider,
      signingContext.owner,
      [fakeInstruction],
    )
    expect(signAndSendResult).toEqual({ signature: 'tx-hash-abc' })
  })
})
