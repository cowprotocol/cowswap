jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  SolanaTradingSdk: jest.fn(),
}))

jest.mock('modules/trade/services/solanaSend/sendSolanaTransaction', () => ({
  sendSolanaTransaction: jest.fn(),
}))

import { getQuoteAmountsAndCosts, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

import { PublicKey, TransactionInstruction, Connection } from '@solana/web3.js'

import { sendSolanaTransaction } from 'modules/trade/services/solanaSend/sendSolanaTransaction'

import { getSolanaJupiterQuote } from './getSolanaJupiterQuote'

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

/** Wires the mocked `SolanaTradingSdk` constructor so `new SolanaTradingSdk(...)` returns an object whose
 * `getQuote` is `mockGetQuote`, and captures the constructor's `signAndSend` option for assertions. */
function mockSolanaTradingSdk(mockGetQuote: jest.Mock): void {
  MockedSolanaTradingSdk.mockImplementation(() => ({ getQuote: mockGetQuote }) as unknown as SolanaTradingSdk)
}

describe('getSolanaJupiterQuote', () => {
  beforeEach(() => {
    MockedSolanaTradingSdk.mockReset()
    mockSendSolanaTransaction.mockReset()
  })

  it('builds QuoteAndPost.quoteResults from real Jupiter amounts', async () => {
    const mockGetQuote = jest.fn().mockResolvedValue({
      quote: {
        intent: {
          owner,
          buyTokenAccount: buyMint,
          buyMint,
          sellTokenAccount: sellMint,
          sellMint,
          sellAmount: 1_000_000_000n,
          buyAmount: 9_707_507_795n,
          validTo: 1_700_001_800,
          kind: OrderKind.SELL,
          partiallyFillable: false,
          createdOnChain: true,
          appData: new Uint8Array(32),
        },
        intentBytes: new Uint8Array(213),
        uid: new Uint8Array(32),
        orderPda: buyMint,
        programId: buyMint,
        jupiterOrder: {
          inputMint: sellMint.toBase58(),
          outputMint: buyMint.toBase58(),
          inAmount: '1000000000',
          outAmount: '9707507795',
          swapMode: 'ExactIn',
          slippageBps: 50,
        },
      },
      postSwapOrderFromQuote: jest.fn(),
    })
    mockSolanaTradingSdk(mockGetQuote)

    const quoteAndPost = await getSolanaJupiterQuote(quoteParams)

    expect(quoteAndPost.quoteResults.quoteResponse.quote.sellAmount).toBe('1000000000')
    expect(quoteAndPost.quoteResults.quoteResponse.quote.buyAmount).toBe('9707507795')
    expect(quoteAndPost.quoteResults.quoteResponse.quote.validTo).toBe(1_700_001_800)
    expect(quoteAndPost.quoteResults.suggestedSlippageBps).toBe(50)

    // `tradeParameters.validFor` is what `getQuoteTimeOffset`/`getOrderValidTo` and
    // `quoteUsingSameParameters` read to compute the real order deadline and detect stale quotes —
    // it must reflect the actual request, not a stub.
    expect(quoteAndPost.quoteResults.tradeParameters).toEqual({
      kind: OrderKind.SELL,
      owner: quoteParams.owner,
      sellToken: quoteParams.sellTokenAddress,
      sellTokenDecimals: quoteParams.sellTokenDecimals,
      buyToken: quoteParams.buyTokenAddress,
      buyTokenDecimals: quoteParams.buyTokenDecimals,
      amount: '1000000000',
      receiver: quoteParams.receiver,
      validFor: quoteParams.validFor,
      partiallyFillable: false,
    })

    const expectedAmountsAndCosts = getQuoteAmountsAndCosts({
      orderParams: quoteAndPost.quoteResults.quoteResponse.quote,
      slippagePercentBps: 50,
      partnerFeeBps: 0,
      protocolFeeBps: 0,
    })
    expect(quoteAndPost.quoteResults.amountsAndCosts).toEqual(expectedAmountsAndCosts)
  })

  it('propagates a posting failure from the SDK and forwards validForSeconds', async () => {
    const mockGetQuote = jest.fn().mockResolvedValue({
      quote: {
        intent: {
          owner,
          buyTokenAccount: buyMint,
          buyMint,
          sellTokenAccount: sellMint,
          sellMint,
          sellAmount: 1n,
          buyAmount: 1n,
          validTo: 0,
          kind: OrderKind.SELL,
          partiallyFillable: false,
          createdOnChain: true,
          appData: new Uint8Array(32),
        },
        intentBytes: new Uint8Array(213),
        uid: new Uint8Array(32),
        orderPda: buyMint,
        programId: buyMint,
        jupiterOrder: {
          inputMint: sellMint.toBase58(),
          outputMint: buyMint.toBase58(),
          inAmount: '1',
          outAmount: '1',
          swapMode: 'ExactIn',
          slippageBps: 0,
        },
      },
      postSwapOrderFromQuote: jest.fn().mockRejectedValue(new Error('Solana wallet not connected')),
    })
    mockSolanaTradingSdk(mockGetQuote)

    const quoteAndPost = await getSolanaJupiterQuote(quoteParams)

    await expect(quoteAndPost.postSwapOrderFromQuote()).rejects.toThrow()

    // `validForSeconds` on the `getQuote` call is how `validFor` is honored on the Solana path — assert
    // it's forwarded as-is.
    expect(mockGetQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        validForSeconds: quoteParams.validFor,
      }),
    )
  })

  it('does not throw when owner is an EVM-shaped address (disconnected / EVM-only session)', async () => {
    const mockGetQuote = jest.fn().mockResolvedValue({
      quote: {
        intent: {
          owner,
          buyTokenAccount: buyMint,
          buyMint,
          sellTokenAccount: sellMint,
          sellMint,
          sellAmount: 1_000_000_000n,
          buyAmount: 9_707_507_795n,
          validTo: 1_700_001_800,
          kind: OrderKind.SELL,
          partiallyFillable: false,
          createdOnChain: true,
          appData: new Uint8Array(32),
        },
        intentBytes: new Uint8Array(213),
        uid: new Uint8Array(32),
        orderPda: buyMint,
        programId: buyMint,
        jupiterOrder: {
          inputMint: sellMint.toBase58(),
          outputMint: buyMint.toBase58(),
          inAmount: '1000000000',
          outAmount: '9707507795',
          swapMode: 'ExactIn',
          slippageBps: 50,
        },
      },
      postSwapOrderFromQuote: jest.fn(),
    })
    mockSolanaTradingSdk(mockGetQuote)

    const evmOwnerQuoteParams: QuoteBridgeRequest = {
      ...quoteParams,
      owner: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    }

    await expect(getSolanaJupiterQuote(evmOwnerQuoteParams)).resolves.toBeDefined()
  })

  it('rejects when receiver is different from owner', async () => {
    const differentReceiver = new PublicKey(new Uint8Array(32).fill(3)).toBase58()

    const paramsWithDifferentReceiver: QuoteBridgeRequest = {
      ...quoteParams,
      receiver: differentReceiver,
    }

    await expect(getSolanaJupiterQuote(paramsWithDifferentReceiver)).rejects.toThrow(
      'Solana quotes do not support a receiver different from the owner yet',
    )
  })
})

describe('getSolanaJupiterQuote postSwapOrderFromQuote', () => {
  const solanaQuoteFixture = {
    intent: {
      owner,
      buyTokenAccount: buyMint,
      buyMint,
      sellTokenAccount: sellMint,
      sellMint,
      sellAmount: 1_000_000_000n,
      buyAmount: 9_707_507_795n,
      validTo: 1_700_001_800,
      kind: OrderKind.SELL,
      partiallyFillable: false,
      createdOnChain: true,
      appData: new Uint8Array(32),
    },
    intentBytes: new Uint8Array(213),
    uid: new Uint8Array(32),
    orderPda: buyMint,
    programId: buyMint,
    jupiterOrder: {
      inputMint: sellMint.toBase58(),
      outputMint: buyMint.toBase58(),
      inAmount: '1000000000',
      outAmount: '9707507795',
      swapMode: 'ExactIn' as const,
      slippageBps: 50,
    },
  }

  let mockGetQuote: jest.Mock
  let mockPostSwapOrderFromQuote: jest.Mock

  beforeEach(() => {
    MockedSolanaTradingSdk.mockReset()
    mockSendSolanaTransaction.mockReset()
    mockPostSwapOrderFromQuote = jest.fn()
    mockGetQuote = jest.fn().mockResolvedValue({
      quote: solanaQuoteFixture,
      postSwapOrderFromQuote: mockPostSwapOrderFromQuote,
    })
    mockSolanaTradingSdk(mockGetQuote)
  })

  it('rejects when no Solana wallet is connected', async () => {
    await getSolanaJupiterQuote(quoteParams, undefined)

    // The disconnected-wallet guard now lives in the `signAndSend` passed to the `SolanaTradingSdk`
    // constructor (rather than a check inside `postSwapOrderFromQuote` itself) — verify it directly.
    const signAndSend = MockedSolanaTradingSdk.mock.calls[0][0].signAndSend
    await expect(signAndSend({} as TransactionInstruction)).rejects.toThrow('Solana wallet not connected')
    expect(mockSendSolanaTransaction).not.toHaveBeenCalled()
  })

  it('signs and sends through the connected wallet when a signing context is provided', async () => {
    mockPostSwapOrderFromQuote.mockResolvedValue({ orderId: 'deadbeef', txHash: 'fake-signature' })

    const signingContext: SolanaSigningContext = {
      owner,
      provider: {} as SolanaProvider,
      connection: {} as Connection,
    }

    const quoteAndPost = await getSolanaJupiterQuote(quoteParams, signingContext)
    const result = await quoteAndPost.postSwapOrderFromQuote()

    expect(mockPostSwapOrderFromQuote).toHaveBeenCalledWith()
    expect(result).toEqual({
      orderId: 'deadbeef',
      txHash: 'fake-signature',
      signingScheme: SigningScheme.PRESIGN,
      signature: 'fake-signature',
      orderToSign: {},
    })

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
