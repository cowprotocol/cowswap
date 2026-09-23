jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  getSolanaQuote: jest.fn(),
}))

import { OrderKind, PriceQuality, QuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
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
  // `useQuoteParams` always fills this in on Solana — user-set or the settings default.
  swapSlippageBps: 50,
  partiallyFillable: false,
}

const advancedSettings: SwapAdvancedSettings = {
  quoteRequest: {
    priceQuality: PriceQuality.FAST,
  },
}

const advancedSettings: SwapAdvancedSettings = {
  quoteRequest: {
    priceQuality: PriceQuality.FAST,
  },
}

/** Stand-in for whatever the SDK resolves with; these tests only care that both halves are passed
 * through, not their internal shape. */
const solanaQuote = { uid: new Uint8Array(32).fill(3) } as SolanaQuote
const sdkResult = { quoteResults: {} as QuoteResults, solanaQuote }

describe('getSolanaQuote', () => {
  beforeEach(() => {
    mockGetSolanaQuoteFromSdk.mockReset()
    mockGetSolanaQuoteFromSdk.mockResolvedValue(sdkResult)
  })

  it('maps quoteParams onto SolanaQuoteParameters', async () => {
    await getSolanaQuote(quoteParams, advancedSettings)

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith(
      {
        ownerAddress: quoteParams.owner,
        sellTokenAddress: quoteParams.sellTokenAddress,
        buyTokenAddress: quoteParams.buyTokenAddress,
        receiverAddress: quoteParams.account,
        sellTokenDecimals: quoteParams.sellTokenDecimals,
        buyTokenDecimals: quoteParams.buyTokenDecimals,
        amount: quoteParams.amount,
        kind: quoteParams.kind,
        partiallyFillable: quoteParams.partiallyFillable,
        validForSeconds: quoteParams.validFor,
        slippageBps: 50,
        priceQuality: PriceQuality.FAST,
      },
      { advancedSettings },
    )
  })

  it('forwards partiallyFillable: true from quoteParams to the SDK call', async () => {
    await getSolanaQuote({ ...quoteParams, partiallyFillable: true }, advancedSettings)

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith(
      expect.objectContaining({ partiallyFillable: true }),
      expect.anything(),
    )
  })

  it('forwards partiallyFillable: false unchanged', async () => {
    await getSolanaQuote({ ...quoteParams, partiallyFillable: false }, advancedSettings)

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith(
      expect.objectContaining({ partiallyFillable: false }),
      expect.anything(),
    )
  })

  it('signs the slippage the user picked, rather than the default', async () => {
    await getSolanaQuote({ ...quoteParams, swapSlippageBps: 300 }, advancedSettings)

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith(
      expect.objectContaining({ slippageBps: 300 }),
      expect.anything(),
    )
  })

  it('reads priceQuality off advancedSettings.quoteRequest', async () => {
    await getSolanaQuote(quoteParams, { quoteRequest: { priceQuality: PriceQuality.VERIFIED } })

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith(
      expect.objectContaining({ priceQuality: PriceQuality.VERIFIED }),
      expect.anything(),
    )
  })

  it('leaves priceQuality undefined when advancedSettings has no quoteRequest', async () => {
    await getSolanaQuote(quoteParams, {})

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith(
      expect.objectContaining({ priceQuality: undefined }),
      expect.anything(),
    )
  })

  it('forwards advancedSettings to the SDK as-is, so it can build appData/signer-aware requests', async () => {
    await getSolanaQuote(quoteParams, advancedSettings)

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith(expect.anything(), { advancedSettings })
  })

  it('exposes solanaQuote alongside quoteResults so the flow can build the CreateOrder instruction', async () => {
    const result = await getSolanaQuote(quoteParams, advancedSettings)

    expect(result.quoteResults).toBe(sdkResult.quoteResults)
    expect(result.solanaQuote).toBe(solanaQuote)
  })

  it('falls back ownerAddress/receiverAddress to account when owner/receiver are not set', async () => {
    const paramsWithoutOwnerOrReceiver: QuoteBridgeRequest = {
      ...quoteParams,
      owner: undefined,
      receiver: null,
    }

    await getSolanaQuote(paramsWithoutOwnerOrReceiver, advancedSettings)

    expect(mockGetSolanaQuoteFromSdk).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerAddress: quoteParams.account,
        receiverAddress: quoteParams.account,
        slippageBps: 50,
      }),
      expect.anything(),
    )
  })

  it('propagates a rejection from the SDK', async () => {
    mockGetSolanaQuoteFromSdk.mockRejectedValue(new Error('no route found'))

    await expect(getSolanaQuote(quoteParams, advancedSettings)).rejects.toThrow('no route found')
  })

  it('never posts the order from the quote — solanaFlow creates it on-chain instead', async () => {
    const { postSwapOrderFromQuote } = await getSolanaQuote(quoteParams, advancedSettings)

    await expect(postSwapOrderFromQuote()).rejects.toThrow('created by solanaFlow')
  })
})
