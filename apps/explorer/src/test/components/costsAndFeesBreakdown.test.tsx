import { ReactNode } from 'react'

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

// Only the HTTP call is mocked; the real types/enums keep getProtocolFees and the labels running.
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

// Each fill charges the same three policies; the zero-amount one must be dropped.
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

// The real chain the app uses: derive the fees from every trade, attach them to the order, render.
function Harness({ order }: { order: Order }): ReactNode {
  const { protocolFees } = useOrderProtocolFees(order)
  return <GasFeeDisplay order={{ ...order, protocolFees }} showBreakdown />
}

// Fees are cached by order, so tests need a fresh cache.
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

    // Reached offset 3, so the fees were aggregated across all three fills, not just the first page.
    expect(mockedGetTrades).toHaveBeenLastCalledWith(expect.objectContaining({ orderId: order.uid, offset: 3 }))

    // Each token keeps its own total; the native gas cost is not folded into the WETH fee.
    const headline = container.textContent || ''
    expect(headline).toContain('ETH')
    expect(headline).toContain('WETH')
    expect(headline).toContain('USDT')

    fireEvent.click(screen.getByText('[+] Show more'))
    expect(screen.getByText('Network costs:')).not.toBeNull()
    expect(screen.getByText('Volume fee:')).not.toBeNull()
    expect(screen.getByText('Price improvement fee:')).not.toBeNull()
    // The zero-amount fee (position 2) is dropped, so the volume fee is not numbered.
    expect(screen.queryByText(/Volume fee \(/)).toBeNull()
  })
})
