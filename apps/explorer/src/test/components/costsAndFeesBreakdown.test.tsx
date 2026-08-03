import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import { SWRConfig } from 'swr'

import { getTrades, Order, RawTrade } from 'api/operator'

import { GasFeeDisplay } from '../../components/orders/GasFeeDisplay'
import { useOrderProtocolFees } from '../../hooks/useOperatorTrades'
import { RICH_ORDER, USDT, WETH } from '../data'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(() => 1),
}))

// Token-metadata boundary; the order's own buy/sell tokens (USDT/WETH) resolve without it.
jest.mock('hooks/useErc20', () => ({
  useMultipleErc20: jest.fn(() => ({ isLoading: false, error: {}, value: {} })),
}))

// Mock only the trades HTTP call; keep the real types/enums so getProtocolFees and the component's
// labels run for real.
jest.mock('api/operator', () => ({
  ...jest.requireActual('api/operator/types'),
  getTrades: jest.fn(),
}))

// The hook imports web3 at module load but never touches it on this path.
jest.mock('../../explorer/api', () => ({
  web3: { eth: { getBlock: jest.fn() } },
}))

const mockedGetTrades = jest.mocked(getTrades)

type Policy = NonNullable<RawTrade['executedProtocolFees']>[number]['policy']
const VOLUME_POLICY: Policy = { volume: { factor: 0.002 } }
const PRICE_IMPROVEMENT_POLICY: Policy = {
  priceImprovement: { factor: 0.5, maxVolumeFactor: 0.01, quote: { sellAmount: '1', buyAmount: '1', fee: '0' } },
}

// Fee policies are applied in the same order on every fill: a volume fee in WETH (position 0), a
// price-improvement fee in USDT (position 1), and a zero-amount fee (position 2) that must be
// dropped from the breakdown. Fills need distinct txHash/logIndex to survive deduplication.
function fill(index: number): RawTrade {
  return {
    txHash: `0xfill${index}`,
    logIndex: index,
    executedProtocolFees: [
      { amount: '10000000000000000', token: WETH.address, policy: VOLUME_POLICY },
      { amount: '400000', token: USDT.address, policy: PRICE_IMPROVEMENT_POLICY },
      { amount: '0', token: USDT.address, policy: VOLUME_POLICY },
    ],
  } as RawTrade
}

// Wires the real chain the app uses: the hook derives the fees from every trade, then (as
// OrderDetails.enrichOrderFromTrades does) they are attached to the order for GasFeeDisplay to render.
function Harness({ order }: { order: Order }): React.ReactNode {
  const { protocolFees } = useOrderProtocolFees(order)
  return <GasFeeDisplay order={{ ...order, protocolFees }} />
}

// The fees are cached by order, so each case needs its own cache — otherwise the first test's
// resolved fees are served to the second one and it never sees the loading state.
function renderHarness(order: Order): ReturnType<typeof render> {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <Harness order={order} />
    </SWRConfig>,
  )
}

describe('costs & fees breakdown (integration)', () => {
  beforeEach(() => mockedGetTrades.mockReset())

  it('derives and renders the breakdown from an order’s trades, end to end', async () => {
    const fills = [fill(0), fill(1), fill(2)]
    // Emulate a server that caps pages below the requested size, forcing the hook to page.
    mockedGetTrades.mockImplementation(async ({ offset = 0 }) => fills.slice(offset, offset + 2))

    const order = { ...RICH_ORDER, gasCost: new BigNumber('2500000000000000') } // 0.0025 native
    const { container } = renderHarness(order)

    await waitFor(() => expect(screen.queryByText('[+] Show more')).not.toBeNull())

    // The hook paged through every fill, advancing by the records actually returned — so
    // getProtocolFees aggregated across all three fills, not just the first page.
    expect(mockedGetTrades).toHaveBeenLastCalledWith(expect.objectContaining({ orderId: order.uid, offset: 3 }))

    // Each token keeps its own total: the native gas cost is not folded into the WETH fee, because
    // they are not the same asset to the user.
    const headline = container.textContent || ''
    expect(headline).toContain('ETH')
    expect(headline).toContain('WETH')
    expect(headline).toContain('USDT')

    fireEvent.click(screen.getByText('[+] Show more'))
    expect(screen.getByText('Network costs:')).not.toBeNull()
    // Labels describe the policy, not who charged it — the API doesn't say.
    expect(screen.getByText('Volume fee:')).not.toBeNull()
    expect(screen.getByText('Price improvement fee:')).not.toBeNull()
    // The zero-amount fee (position 2) is dropped, so the volume fee is not numbered.
    expect(screen.queryByText(/Volume fee \(/)).toBeNull()
  })

  it('shows the legacy fee instead of a breakdown while the fees are still unknown', async () => {
    // Never resolves: the fees are in flight for the whole render.
    mockedGetTrades.mockImplementation(() => new Promise(() => undefined))

    const order = { ...RICH_ORDER, gasCost: new BigNumber('2500000000000000') }
    renderHarness(order)

    // No expander and no network-costs row: a total omitting the fees is never shown.
    expect(screen.queryByText('[+] Show more')).toBeNull()
    expect(screen.queryByText('Network costs:')).toBeNull()
  })
})
