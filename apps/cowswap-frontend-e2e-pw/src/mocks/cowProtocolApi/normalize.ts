import { createHash } from 'node:crypto'

import type { CowApiRequest } from './types'

const ONE_HOUR_SEC = 3600

interface OrderLike {
  owner?: string
  receiver?: string
  uid?: string
  creationDate?: string
  validTo?: number
  status?: string
}

type QuoteOverridableField = 'sellToken' | 'buyToken' | 'receiver' | 'appData'

interface QuoteRequestBody {
  sellToken?: string
  buyToken?: string
  receiver?: string
  from?: string
  kind?: 'sell' | 'buy'
  appData?: string
  sellAmountBeforeFee?: string
  sellAmountAfterFee?: string
  buyAmountAfterFee?: string
}

/**
 * Deterministic 56-byte uid derived from the posted order, so a re-run of the
 * same test produces the same uid and traces stay comparable.
 */
export function fakeOrderUid(body: unknown): string {
  const digest = createHash('sha256')
    .update(JSON.stringify(body ?? {}))
    .digest('hex')
  return `0x${digest.repeat(2).slice(0, 112)}`
}

/**
 * `status` is pinned to `open` rather than inherited from the fixture: the
 * default must not drift when the fixture is re-recorded from a different
 * order. Specs wanting another status override `order`.
 */
export function normalizeOrder(body: unknown, req: CowApiRequest): unknown {
  if (typeof body !== 'object' || body === null) return body
  return { ...freshenOrder(body as OrderLike, req), status: 'open' }
}

/**
 * Recorded order fixtures belong to a real account and carry absolute
 * timestamps, so verbatim they render as a stranger's expired orders. Re-own
 * them and push their deadlines forward.
 */
export function normalizeOrderList(body: unknown, req: CowApiRequest): unknown {
  if (!Array.isArray(body)) return body
  return body.map((order) => freshenOrder(order as OrderLike, req))
}

/**
 * The recorded quote is a mainnet WETH→USDC quote for 1 WETH. Served verbatim
 * it would show mainnet amounts for whatever pair the test actually asked for.
 * Echo the request, pin the requested side to the requested amount, and derive
 * the other side by preserving the fixture's own price ratio.
 *
 * The derived price is a deterministic placeholder. A spec asserting on a
 * specific output amount must override `quote`.
 */
export function normalizeQuote(body: unknown, req: CowApiRequest): unknown {
  if (typeof body !== 'object' || body === null) return body
  const fixture = body as { quote: Record<string, unknown>; from?: string }
  const request = (req.body ?? {}) as QuoteRequestBody

  const fixtureSell = String(fixture.quote.sellAmount)
  const fixtureBuy = String(fixture.quote.buyAmount)
  const kind = resolveQuoteKind(request, fixture.quote.kind)
  const { sellAmount, buyAmount } = resolveQuoteAmounts(kind, request, fixtureSell, fixtureBuy)

  return {
    ...fixture,
    quote: {
      ...fixture.quote,
      ...requestedQuoteFields(request),
      kind,
      sellAmount,
      buyAmount,
      validTo: nowSeconds() + 600,
    },
    ...(request.from ? { from: request.from } : {}),
    expiration: new Date(Date.now() + 60_000).toISOString(),
  }
}

/** Trades carry an `owner` but no `validTo`/`creationDate`. */
export function normalizeTrades(body: unknown, req: CowApiRequest): unknown {
  if (!Array.isArray(body)) return body
  const owner = subjectAddress(req)
  if (!owner) return body
  return body.map((trade) => ({ ...(trade as Record<string, unknown>), owner }))
}

function freshenOrder(order: OrderLike, req: CowApiRequest): OrderLike {
  const owner = subjectAddress(req)
  return {
    ...order,
    ...(owner ? { owner, receiver: owner } : {}),
    ...(req.params.uid ? { uid: req.params.uid } : {}),
    creationDate: new Date().toISOString(),
    validTo: nowSeconds() + ONE_HOUR_SEC,
  }
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

/** Only the sides the request actually named, so the fixture's own values pass through untouched otherwise. */
function requestedQuoteFields(request: QuoteRequestBody): Partial<Record<QuoteOverridableField, string>> {
  const fields: Partial<Record<QuoteOverridableField, string>> = {}
  if (request.sellToken) fields.sellToken = request.sellToken
  if (request.buyToken) fields.buyToken = request.buyToken
  if (request.receiver) fields.receiver = request.receiver
  if (request.appData) fields.appData = request.appData
  return fields
}

/** Pins the requested side's amount to exactly what was asked for; the third case handles neither side named. */
function resolveQuoteAmounts(
  kind: 'sell' | 'buy',
  request: QuoteRequestBody,
  fixtureSell: string,
  fixtureBuy: string,
): { sellAmount: string; buyAmount: string } {
  const requestedSell = request.sellAmountBeforeFee ?? request.sellAmountAfterFee
  const requestedBuy = request.buyAmountAfterFee

  if (kind === 'sell' && requestedSell) {
    return { sellAmount: requestedSell, buyAmount: scale(requestedSell, fixtureSell, fixtureBuy) }
  }
  if (kind === 'buy' && requestedBuy) {
    return { buyAmount: requestedBuy, sellAmount: scale(requestedBuy, fixtureBuy, fixtureSell) }
  }
  return { sellAmount: requestedSell ?? fixtureSell, buyAmount: requestedBuy ?? fixtureBuy }
}

function resolveQuoteKind(request: QuoteRequestBody, fixtureKind: unknown): 'sell' | 'buy' {
  return request.kind ?? (fixtureKind as 'sell' | 'buy' | undefined) ?? 'sell'
}

function scale(reference: string, from: string, to: string): string {
  const ref = BigInt(reference)
  const fromAmount = BigInt(from)
  const toAmount = BigInt(to)
  if (fromAmount === 0n) return toAmount.toString()
  return ((ref * toAmount) / fromAmount).toString()
}

/** Address the fixture should appear to belong to for this request. */
function subjectAddress(req: CowApiRequest): string | undefined {
  return (req.params.address ?? req.query.get('owner') ?? undefined)?.toLowerCase()
}
