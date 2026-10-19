import type { NextRequest } from 'next/server'

import { RWA_ASSET_TYPE_LABELS, type RwaAsset } from '@/entities/asset'
import { getAssets } from '@/entities/asset/index.server'
import { getChainLabel } from '@/shared/lib/chain'

const LLMS_TXT_MAX_AGE_SECONDS = 3600
const WIDGET_DOCS_URL = 'https://docs.cow.fi/cow-protocol/tutorials/widget'
const COW_PROTOCOL_DOCS_URL = 'https://docs.cow.fi/cow-protocol'

/** `origin` prefixes every app link, e.g. `https://example.com` */
export function buildLlmsTxt(assets: RwaAsset[], origin: string): string {
  const issuers = unique(assets.flatMap((asset) => asset.tokens.map((token) => token.issuer)))
  const networks = unique(assets.flatMap((asset) => asset.tokens.map((token) => getChainLabel(token.chainId))))
  const [exampleAsset] = assets
  const exampleUrl = exampleAsset ? `${origin}/asset/${exampleAsset.ticker}` : `${origin}/`

  return [
    '# CoW RWA',
    '',
    '> Trade tokenized stocks and ETFs with CoW Protocol',
    '',
    `CoW RWA lists ${assets.length} real-world assets tokenized by ${issuers.join(', ')} on ${networks.join(', ')}.`,
    'Each asset groups the tokens of every issuer and network. Prices, market cap and volume are the tokenized market of the asset over every chain and issuer, from CoinGecko.',
    'Trades are settled by CoW Protocol.',
    '',
    'To trade an asset, open its page, `/asset/{TICKER}` with an upper-case ticker. Its trade widget is the CoW Swap widget, with a token picker above it:',
    '',
    '1. Pick Buy or Sell.',
    '2. Pick a network. The widget follows the network of the connected wallet, so picking another network asks the wallet to switch.',
    '3. Pick a stock token. Each token of the asset on the network shows its quote per share for a $1,000 order, including network costs and fees. The best quote is selected by default. Picking a token in the "Stock tokens" table of the page selects it in the widget too.',
    '4. Connect a wallet with the button above the widget. The widget has no connect button of its own.',
    '5. Trade in the Swap tab for a market order, or in the Limit tab for a limit order. A buy starts at 1,000 USDC for the token, a sell at 1 token for USDC. Amounts can be edited in the widget.',
    '',
    '## Pages',
    '',
    `- [Markets](${origin}/): every asset with price, 24h change, market cap and volume, plus the most traded assets and top movers`,
    `- [Portfolio](${origin}/portfolio): balances and trades of the connected wallet`,
    `- [Asset page](${exampleUrl}): price chart, tokens per issuer and network, onchain stats, issuer news and the trade widget`,
    '',
    '## Trading',
    '',
    `- [Trade widget](${exampleUrl}): on every asset page, see the steps above`,
    `- [CoW Swap widget docs](${WIDGET_DOCS_URL}): parameters and events of the embedded widget`,
    '',
    '## Optional',
    '',
    `- [CoW Protocol docs](${COW_PROTOCOL_DOCS_URL}): how orders are matched and settled`,
    ...assets.map((asset) => formatAsset(asset, origin)),
    '',
  ].join('\n')
}

/** [llms.txt](https://llmstxt.org) of the app: pages, trading and every registry asset */
export function getLlmsTxtHandler(request: NextRequest): Response {
  return new Response(buildLlmsTxt(getAssets(), request.nextUrl.origin), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': `public, s-maxage=${LLMS_TXT_MAX_AGE_SECONDS}`,
    },
  })
}

function formatAsset(asset: RwaAsset, origin: string): string {
  const issuers = unique(asset.tokens.map((token) => token.issuer)).sort()

  return `- [${asset.title} (${asset.ticker})](${origin}/asset/${asset.ticker}): ${RWA_ASSET_TYPE_LABELS[asset.type]}, ${issuers.join(', ')}`
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
