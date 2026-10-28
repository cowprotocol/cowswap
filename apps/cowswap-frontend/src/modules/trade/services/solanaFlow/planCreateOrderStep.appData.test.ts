/**
 * @jest-environment node
 */
import { LatestAppDataDocVersion, OrderKind, stringifyDeterministic } from '@cowprotocol/cow-sdk'
import type { SolanaSwapOrderQuote } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

import { toKeccak256 } from 'common/utils/toKeccak256'

import { planCreateOrderStep } from './planCreateOrderStep'

// Runs the real SDK, unlike planCreateOrderStep.test.ts: the flow registers `stringifyDeterministic(doc)`
// under the hash this returns, so a change in how the SDK merges or hashes the doc must fail here, not in prod.

const pubkey = (fill: number): PublicKey => new PublicKey(new Uint8Array(32).fill(fill))

// The quote's `appDataInfo` is the stub `getSolanaQuote` returns: Solana quotes carry no appData doc.
const quote = {
  quoteResults: { appDataInfo: {} },
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
      appData: new Uint8Array(32),
    },
  },
} as unknown as SolanaSwapOrderQuote

async function plan(appDataDoc: LatestAppDataDocVersion): Promise<string> {
  const { appData } = await planCreateOrderStep({
    ...quote,
    appDataDoc,
    sellSymbol: 'SOL',
    buySymbol: 'USDC',
    validTo: 1_700_000_600,
  })

  return appData
}

// The doc of a swap the order book accepted and settled (barn order 0x221a08e4…), and the hash it stored it under.
const SETTLED_SWAP_DOC: LatestAppDataDocVersion = {
  version: '1.15.0',
  appCode: 'CoW Swap',
  environment: 'pr',
  metadata: { orderClass: { orderClass: 'market' }, quote: { slippageBips: 39, smartSlippage: true } },
}
const SETTLED_SWAP_APP_DATA = '0xd898817e8c4b69f38766368768732219269470f1ea3a47c833fe2c659f3a32a2'

describe('planCreateOrderStep · signed appData', () => {
  it('signs the hash the order book stores the doc under', async () => {
    expect(await plan(SETTLED_SWAP_DOC)).toBe(SETTLED_SWAP_APP_DATA)
  })

  it.each<[string, LatestAppDataDocVersion]>([
    ['a swap doc as buildAppData produces it', SETTLED_SWAP_DOC],
    ['the fallback doc with empty metadata', { version: '1.15.0', appCode: 'CoW Swap', metadata: {} }],
  ])('signs the keccak256 of the deterministic doc for %s', async (_, appDataDoc) => {
    const signedAppData = await plan(appDataDoc)

    expect(signedAppData).toBe(toKeccak256(await stringifyDeterministic(appDataDoc)))
  })

  // The SDK merges the doc onto `{ metadata: {} }`, so a doc without metadata gets one injected and its
  // signed hash no longer matches its own stringification: the flow's pre-upload check rejects it.
  it('signs a different hash for a doc without metadata', async () => {
    const appDataDoc = { version: '1.15.0', appCode: 'CoW Swap' } as LatestAppDataDocVersion

    const signedAppData = await plan(appDataDoc)

    expect(signedAppData).not.toBe(toKeccak256(await stringifyDeterministic(appDataDoc)))
  })
})
