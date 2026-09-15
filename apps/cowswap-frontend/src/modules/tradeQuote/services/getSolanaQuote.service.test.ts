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
const solanaQuote = { uid: new Uint8Array(32).fill(3) } as SolanaQuote
const sdkResult = { quoteResults: {} as QuoteResults, solanaQuote }

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
    })
  })

  it('exposes solanaQuote alongside quoteResults so the flow can build the CreateOrder instruction', async () => {
    const result = await getSolanaQuote(quoteParams)

    expect(result.quoteResults).toBe(sdkResult.quoteResults)
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
