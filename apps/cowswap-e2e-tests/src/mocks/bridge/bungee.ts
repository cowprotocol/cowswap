import { loadFixture } from './loadFixture'

import type { BrowserContext, Route } from '@playwright/test'

// Matches both the real Bungee backend (prod-like builds) and the barn proxy CoW falls back to
// otherwise — see `getBungeeApiBase()` in `apps/cowswap-frontend/src/tradingSdk/bridgingSdk.ts`.
const BUNGEE_URL_PATTERN =
  /^https:\/\/(?:backend\.bungee\.exchange|bff\.barn\.cow\.fi\/proxies\/socket)\/api\/v1\/(?:bungee|bungee-manual)\//i

const BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS = '0xD06a673fe1fa27B1b9E5BA0be980AB15Dbce85cc'
// Selector for the `across` family's `bridgeERC20To` (see `BungeeTxDataBytesIndices` in
// `@cowprotocol/sdk-bridging`). `bungee-quote.json`'s manual routes sort with "Across" first
// (highest `output.amount`), and `createBungeeDepositCall()` looks this selector up by whichever
// bridge family the selected route belongs to when it later builds the real deposit call.
const ACROSS_BRIDGE_ERC20_TO_SELECTOR = 'cc54d224'

export interface BungeeMock {
  reset(): void
}

interface BungeeAmountField {
  amount: string
  valueInUsd: number
  token: { decimals: number }
  effectiveAmount?: string
  effectiveValueInUsd?: number
  minAmountOut?: string
  effectiveReceivedInUsd?: number
}

interface BungeeQuoteFixture {
  result: {
    input: BungeeAmountField
    manualRoutes: ReadonlyArray<{ output: BungeeAmountField }>
  }
}

export function installBungee(context: BrowserContext): BungeeMock {
  const quoteFixture = loadFixture('bungee-quote.json') as BungeeQuoteFixture
  const destTokensFixture = loadFixture('bungee-dest-tokens.json')
  const intermediateTokensFixture = loadFixture('bungee-intermediate-tokens.json')

  void context.route(BUNGEE_URL_PATTERN, async (route: Route) => {
    const pathname = new URL(route.request().url()).pathname

    if (pathname.endsWith('/quote')) {
      // The app briefly requests a quote at amount=0 while a typed amount is still debouncing in.
      // Echoing the fixture's success response back unconditionally feeds that zero into the SDK's
      // own amount-based math (`calculateFeeBps`), dividing by it and crashing instead of the
      // harmless "no routes for this (nonsensical) request" the real API would produce — answer
      // with an empty (but schema-valid, see `isValidQuoteResponse`) route list instead, which the
      // SDK turns into a clean, expected `NO_ROUTES` rather than an unhandled exception.
      const params = new URL(route.request().url()).searchParams
      const amount = params.get('inputAmount')
      if (!amount || amount === '0') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            statusCode: 200,
            result: {
              originChainId: Number(params.get('originChainId')),
              destinationChainId: Number(params.get('destinationChainId')),
              userAddress: params.get('userAddress'),
              receiverAddress: params.get('receiverAddress'),
              input: null,
              autoRoute: null,
              manualRoutes: [],
            },
            message: null,
          }),
        })
        return
      }
      const scaledFixture = scaleBungeeQuoteFixture(quoteFixture, BigInt(amount))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(scaledFixture) })
      return
    }
    if (pathname.endsWith('/build-tx')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(buildTxResponse()) })
      return
    }
    if (pathname.endsWith('/dest-tokens')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(destTokensFixture) })
      return
    }
    if (pathname.endsWith('/intermediate-tokens')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(intermediateTokensFixture),
      })
      return
    }
    await route.fallback()
  })

  return {
    reset() {
      // Fixtures are served as-is for every test — nothing mutable to reset yet.
    },
  }
}

function buildTxResponse(): unknown {
  // `decodeBungeeBridgeTxData` just needs a 4-byte routeId followed by a function selector it
  // recognizes for the quote's bridge family — on-chain verification (not this payload) is what
  // actually gates whether the quote is accepted, see `mocks/socketVerifier.ts`.
  const routeId = '00000001'
  const data = `0x${routeId}${ACROSS_BRIDGE_ERC20_TO_SELECTOR}${'0'.repeat(64)}`
  return {
    success: true,
    statusCode: 200,
    result: { txData: { to: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS, data, value: '0' } },
    message: null,
  }
}

/**
 * `bungee-quote.json` was captured for one specific sell amount (~4.96 USDC-worth of input) — its
 * `output.amount` is a static number unrelated to whatever amount an individual test actually
 * requests. `BungeeBridgeProvider.toAmountsAndCosts()` (in `@cowprotocol/sdk-bridging`) builds
 * `sellAmount` from the *live* request amount but `buyAmount` straight from this static fixture,
 * so serving it unscaled makes the bridge leg's own before/after ratio wildly wrong for any sell
 * amount other than the one it was captured for — enough to trip the "Confirm Price Impact" dialog
 * (see `useEstimatedBridgeBuyAmount`, which rescales the swap leg's real output through exactly
 * that ratio). Scaling every amount field by the fixture's own input:output ratio keeps the ratio
 * — and therefore price impact — realistic regardless of the amount a given test asks for.
 */
function scaleBungeeQuoteFixture(fixture: BungeeQuoteFixture, requestedInputAmount: bigint): unknown {
  const { input, manualRoutes } = fixture.result
  const fixtureInputAmount = BigInt(input.amount)
  const scale = (amount: string): string => ((BigInt(amount) * requestedInputAmount) / fixtureInputAmount).toString()

  return {
    ...fixture,
    result: {
      ...fixture.result,
      input: {
        ...input,
        amount: requestedInputAmount.toString(),
        valueInUsd: toUsd(requestedInputAmount.toString(), input.token.decimals),
      },
      manualRoutes: manualRoutes.map((route) => {
        const { output } = route
        const amount = scale(output.amount)
        const effectiveAmount = output.effectiveAmount ? scale(output.effectiveAmount) : undefined
        const minAmountOut = output.minAmountOut ? scale(output.minAmountOut) : undefined
        // Preserves the fixture's own (small) effective-vs-gross fee ratio rather than assuming one.
        const feeRatio =
          output.effectiveReceivedInUsd && output.effectiveValueInUsd
            ? output.effectiveReceivedInUsd / output.effectiveValueInUsd
            : 1
        const effectiveValueInUsd = effectiveAmount ? toUsd(effectiveAmount, output.token.decimals) : undefined
        return {
          ...route,
          output: {
            ...output,
            amount,
            valueInUsd: toUsd(amount, output.token.decimals),
            ...(effectiveAmount ? { effectiveAmount } : {}),
            ...(effectiveValueInUsd !== undefined ? { effectiveValueInUsd } : {}),
            ...(minAmountOut ? { minAmountOut } : {}),
            ...(effectiveValueInUsd !== undefined ? { effectiveReceivedInUsd: effectiveValueInUsd * feeRatio } : {}),
          },
        }
      }),
    },
  }
}

// `Number(amount)` on a raw base-unit string stays inside Number.MAX_SAFE_INTEGER for the
// committed 6-decimal USDC fixture — an 18-decimal fixture's scaled amount could exceed it and
// silently lose precision here.
function toUsd(amount: string, decimals: number): number {
  return Number(amount) / 10 ** decimals
}
