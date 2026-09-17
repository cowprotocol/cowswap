jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  getSolanaQuote: jest.fn(),
}))

import { OrderKind, QuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { getSolanaQuote as getSolanaQuoteFromSdk, SolanaQuote } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

import { getSolanaQuote } from './getSolanaQuote.service'

const mockGetSolanaQuoteFromSdk = getSolanaQuoteFromSdk as jest.MockedFunction<typeof getSolanaQuoteFromSdk>

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

/** Stand-in for whatever the SDK resolves with; these tests only care that both halves are passed
 * through, not their internal shape. */
const JUPITER_SLIPPAGE_BPS = 7
const solanaQuote = {
  uid: new Uint8Array(32).fill(3),
  jupiterOrder: { slippageBps: JUPITER_SLIPPAGE_BPS },
} as SolanaQuote
// The SDK echoes back whatever tolerance it was handed; the fixture mirrors that.
const sdkResult = { quoteResults: { suggestedSlippageBps: 50 } as QuoteResults, solanaQuote }

describe('getSolanaQuote', () => {
  beforeEach(() => {
    mockGetSolanaQuoteFromSdk.mockReset()
    mockGetSolanaQuoteFromSdk.mockResolvedValue(sdkResult)
  })

  it('maps quoteParams onto SolanaQuoteParameters', async () => {
    await getSolanaQuote(quoteParams)

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith({
      ownerAddress: quoteParams.owner,
      sellTokenAddress: quoteParams.sellTokenAddress,
      buyTokenAddress: quoteParams.buyTokenAddress,
      receiverAddress: quoteParams.account,
      sellTokenDecimals: quoteParams.sellTokenDecimals,
      buyTokenDecimals: quoteParams.buyTokenDecimals,
      amount: quoteParams.amount,
      kind: quoteParams.kind,
      validForSeconds: quoteParams.validFor,
      slippageBps: 50,
    })
  })

  it('signs the slippage the user picked, rather than the default', async () => {
    await getSolanaQuote({ ...quoteParams, swapSlippageBps: 300 })

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith(expect.objectContaining({ slippageBps: 300 }))
  })

  // Otherwise "Auto" latches onto the user's own number, and `useSmartSlippageFromQuote` caches it in a
  // ref that outlives a chain switch, leaking a Solana tolerance into EVM quotes.
  it('reports the provider suggestion, not the tolerance we passed in', async () => {
    const result = await getSolanaQuote({ ...quoteParams, swapSlippageBps: 300 })

    expect(result.quoteResults.suggestedSlippageBps).toBe(JUPITER_SLIPPAGE_BPS)
  })

  it('exposes solanaQuote alongside quoteResults so the flow can build the CreateOrder instruction', async () => {
    const result = await getSolanaQuote(quoteParams)

    // Passed through as-is apart from the one field this service deliberately corrects.
    expect(result.quoteResults).toMatchObject({
      ...sdkResult.quoteResults,
      suggestedSlippageBps: JUPITER_SLIPPAGE_BPS,
    })
    expect(result.solanaQuote).toBe(solanaQuote)
  })

  it('falls back ownerAddress/receiverAddress to account when owner/receiver are not set', async () => {
    const paramsWithoutOwnerOrReceiver: QuoteBridgeRequest = {
      ...quoteParams,
      owner: undefined,
      receiver: null,
    }

    await getSolanaQuote(paramsWithoutOwnerOrReceiver)

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerAddress: quoteParams.account,
        receiverAddress: quoteParams.account,
        slippageBps: 50,
      }),
    )
  })

  it('propagates a rejection from the SDK', async () => {
    mockGetSolanaQuoteFromSdk.mockRejectedValue(new Error('no route found'))

    await expect(getSolanaQuote(quoteParams)).rejects.toThrow('no route found')
  })

  it('never posts the order from the quote — solanaFlow creates it on-chain instead', async () => {
    const { postSwapOrderFromQuote } = await getSolanaQuote(quoteParams)

    await expect(postSwapOrderFromQuote()).rejects.toThrow('created by solanaFlow')
  })
})
