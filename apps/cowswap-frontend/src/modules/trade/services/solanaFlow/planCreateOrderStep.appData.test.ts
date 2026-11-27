/**
 * @jest-environment node
 */
import { LatestAppDataDocVersion, OrderKind, stringifyDeterministic } from '@cowprotocol/cow-sdk'
import { buildSolanaAppData, SolanaSwapOrderQuote } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

import { toKeccak256 } from 'common/utils/toKeccak256'

import { planCreateOrderStep } from './planCreateOrderStep'
import { SolanaFlowStep } from './types'

// Runs the real SDK, unlike planCreateOrderStep.test.ts: the flow registers the returned `fullAppData`
// under the hash this signs, so a change in how the SDK merges or hashes the doc must fail here, not in prod.

const pubkey = (fill: number): PublicKey => new PublicKey(new Uint8Array(32).fill(fill))

const SWAP_DOC: LatestAppDataDocVersion = {
  version: '1.15.0',
  appCode: 'CoW Swap',
  environment: 'pr',
  metadata: { orderClass: { orderClass: 'market' }, quote: { slippageBips: 39, smartSlippage: true } },
}
const UTM = { utmSource: 'twitter', utmMedium: 'social', utmCampaign: 'launch', utmContent: 'post', utmTerm: 'swap' }
const SWAP_DOC_WITH_UTM: LatestAppDataDocVersion = { ...SWAP_DOC, metadata: { ...SWAP_DOC.metadata, utm: UTM } }

// The quote's doc as `getSolanaQuote` builds it from the app's doc at quote time.
async function buildQuote(quoteAppDataDoc: LatestAppDataDocVersion): Promise<SolanaSwapOrderQuote> {
  const appDataInfo = await buildSolanaAppData(
    { appCode: 'CoW Swap', orderClass: 'market', slippageBps: 50 },
    quoteAppDataDoc,
  )

  return {
    quoteResults: { appDataInfo },
    solanaQuote: {
      programId: pubkey(5),
      orderPda: pubkey(4),
      uid: new Uint8Array(32).fill(7),
      env: 'staging',
      intent: {
        owner: pubkey(9),
        sellTokenAccount: pubkey(10),
        sellMint: pubkey(11),
        buyTokenAccount: pubkey(12),
        buyMint: pubkey(13),
        sellAmount: 1_000_000n,
        buyAmount: 1_900_000n,
        validTo: 1_700_000_000,
        kind: OrderKind.SELL,
        partiallyFillable: false,
        appData: appDataInfo.appDataBytes,
      },
    },
  } as unknown as SolanaSwapOrderQuote
}

// A different appCode at quote time, so a merge that kept any quote-time value would show in `fullAppData`.
const QUOTE_APP_CODE = 'Quote-time app'

async function plan(appDataDoc: LatestAppDataDocVersion): Promise<{ appData: string; fullAppData: string }> {
  const { appData, fullAppData } = await planCreateOrderStep({
    ...(await buildQuote({ ...appDataDoc, appCode: QUOTE_APP_CODE })),
    appDataDoc,
    sellSymbol: 'SOL',
    buySymbol: 'USDC',
    validTo: 1_700_000_600,
  })

  return { appData, fullAppData: fullAppData ?? '' }
}

describe('planCreateOrderStep · signed appData', () => {
  it.each<[string, LatestAppDataDocVersion]>([
    ['without UTM', SWAP_DOC],
    ['with UTM', SWAP_DOC_WITH_UTM],
  ])('signs the keccak256 of the returned fullAppData for a doc %s', async (_, appDataDoc) => {
    const { appData, fullAppData } = await plan(appDataDoc)

    expect(appData).toBe(toKeccak256(fullAppData))
  })

  it("signs the app's doc unchanged when it carries every key the quote's doc has", async () => {
    const { fullAppData } = await plan(SWAP_DOC_WITH_UTM)

    expect(fullAppData).toBe(await stringifyDeterministic(SWAP_DOC_WITH_UTM))
  })

  it("keeps the app's slippage over the quote's", async () => {
    const { fullAppData } = await plan(SWAP_DOC_WITH_UTM)

    expect(JSON.parse(fullAppData).metadata.quote).toEqual({ slippageBips: 39, smartSlippage: true })
  })

  it("keeps the app's appCode over the quote's", async () => {
    const { fullAppData } = await plan(SWAP_DOC_WITH_UTM)

    expect(JSON.parse(fullAppData).appCode).toBe(SWAP_DOC_WITH_UTM.appCode)
  })

  // Same as an EVM order: the SDK adds its default UTM to a doc that has none.
  it('signs the SDK default UTM into a doc without one', async () => {
    const { fullAppData } = await plan(SWAP_DOC)

    expect(JSON.parse(fullAppData).metadata.utm).toEqual(expect.objectContaining({ utmSource: 'cowmunity' }))
    expect(fullAppData).not.toBe(await stringifyDeterministic(SWAP_DOC))
  })
})

// Whether a creation carries the memo naming its quote is the SDK's own default, keyed off `sponsor`,
// and both sides of it are load-bearing: the order book refuses a sponsored bundle holding an
// instruction its template does not name, and a self-paid creation without the memo leaves the order
// linked to whichever quote the back end guesses. Pinned against the real SDK, since the mocked suite
// cannot see a default change.
describe('planCreateOrderStep · quote memo', () => {
  const QUOTE_ID = 161211

  async function planStep(sponsor?: PublicKey): Promise<SolanaFlowStep> {
    const quote = await buildQuote(SWAP_DOC)
    const { step } = await planCreateOrderStep({
      ...quote,
      quoteResults: { ...quote.quoteResults, quoteResponse: { id: QUOTE_ID } } as SolanaSwapOrderQuote['quoteResults'],
      appDataDoc: SWAP_DOC,
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: 1_700_000_600,
      sponsor,
    })

    return step
  }

  it('names the quote ahead of a self-paid creation', async () => {
    const { instructions } = await planStep()

    expect(instructions).toHaveLength(2)
    expect(instructions[0].data.toString('utf8')).toBe(`cow:quote:${QUOTE_ID}`)
  })

  it('leaves a sponsored bundle carrying the creation alone', async () => {
    const { instructions } = await planStep(pubkey(3))

    expect(instructions).toHaveLength(1)
  })
})
