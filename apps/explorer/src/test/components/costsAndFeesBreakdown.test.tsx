import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import BigNumber from 'bignumber.js'

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

// Fee policies are fixed for an order and applied in the same order on every fill: a protocol volume
// fee in WETH (position 0), a partner price-improvement fee in USDT (position 1), and a zero-amount
// fee (position 2) that must be dropped from the breakdown.
function fill(): RawTrade {
  return {
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
  const { protocolFees, isLoading } = useOrderProtocolFees(order)
  if (isLoading) return null
  return <GasFeeDisplay order={{ ...order, protocolFees }} />
}

describe('costs & fees breakdown (integration)', () => {
  it('derives and renders the breakdown from an order’s trades, end to end', async () => {
    const fills = [fill(), fill(), fill()]
    // Emulate a server that caps pages below the requested size, forcing the hook to page.
    mockedGetTrades.mockImplementation(async ({ offset = 0 }) => fills.slice(offset, offset + 2))

    const order = { ...RICH_ORDER, gasCost: new BigNumber('2500000000000000') } // 0.0025 native
    const { container } = render(<Harness order={order} />)

    await waitFor(() => expect(screen.queryByText('[+] Show more')).not.toBeNull())

    // The hook paged through every fill (2 + 1, then a terminal empty page), advancing by the records
    // actually returned — so getProtocolFees aggregated across all three fills, not just the first page.
    expect(mockedGetTrades).toHaveBeenCalledTimes(3)
    expect(mockedGetTrades).toHaveBeenLastCalledWith(expect.objectContaining({ orderId: order.uid, offset: 3 }))

    // Headline folds the native network cost and the WETH protocol fee into one native (ETH) figure,
    // while the USDT partner fee stays as its own per-token total.
    const headline = container.textContent || ''
    expect(headline).toContain('ETH')
    expect(headline).toContain('USDT')
    expect(headline).not.toContain('WETH')

    fireEvent.click(screen.getByText('[+] Show more'))
    expect(screen.getByText('Network costs:')).not.toBeNull()
    expect(screen.getByText('Protocol fee:')).not.toBeNull() // position 0 = the protocol's own fee
    expect(screen.getByText('Partner 1 price improvement share:')).not.toBeNull() // position 1 = partner
    // The zero-amount fee (position 2) is dropped, so there is no second partner row.
    expect(screen.queryByText(/Partner 2/)).toBeNull()
  })
})
