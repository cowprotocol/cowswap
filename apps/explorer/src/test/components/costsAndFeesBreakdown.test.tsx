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

type ExecutedFee = NonNullable<RawTrade['executedProtocolFees']>[number]
type Policy = ExecutedFee['policy']

const VOLUME_POLICY: Policy = { volume: { factor: 0.002 } }
const SURPLUS_POLICY: Policy = { surplus: { factor: 0.5, maxVolumeFactor: 0.01 } }
const PRICE_IMPROVEMENT_POLICY: Policy = {
  priceImprovement: { factor: 0.5, maxVolumeFactor: 0.01, quote: { sellAmount: '1', buyAmount: '1', fee: '0' } },
}

const PARTNER = '0x1111111111111111111111111111111111111111'

function appData(partnerFee?: unknown): string {
  return JSON.stringify({ version: '1.1.0', metadata: partnerFee ? { partnerFee } : {} })
}

// Fee policies are fixed per order, so every fill reports the same ones.
function fills(executedProtocolFees: ExecutedFee[], count = 3): RawTrade[] {
  return Array.from({ length: count }, () => ({ executedProtocolFees }) as RawTrade)
}

// Wires the real chain the app uses: the hook derives the fees from every trade, then (as
// OrderDetails.enrichOrderFromTrades does) they are attached to the order for GasFeeDisplay to render.
function Harness({ order }: { order: Order }): React.ReactNode {
  const { protocolFees, isLoading } = useOrderProtocolFees(order)
  if (isLoading) return null
  return <GasFeeDisplay order={{ ...order, protocolFees }} />
}

function order(fullAppData?: string): Order {
  return { ...RICH_ORDER, gasCost: new BigNumber('2500000000000000'), fullAppData } // 0.0025 native
}

/** Renders the breakdown, returning the collapsed headline before expanding the per-fee rows. */
async function renderBreakdown(order: Order): Promise<{ headline: string }> {
  const { container } = render(<Harness order={order} />)
  await waitFor(() => expect(screen.queryByText('[+] Show more')).not.toBeNull())

  const headline = container.textContent || ''
  fireEvent.click(screen.getByText('[+] Show more'))

  return { headline }
}

describe('costs & fees breakdown (integration)', () => {
  it('derives and renders the breakdown from an order’s trades, end to end', async () => {
    // A protocol volume fee, a protocol surplus fee that captured nothing, and the declared partner
    // fee last (where the autopilot appends it).
    const fill: ExecutedFee[] = [
      { amount: '10000000000000000', token: WETH.address, policy: VOLUME_POLICY },
      { amount: '0', token: USDT.address, policy: SURPLUS_POLICY },
      { amount: '400000', token: USDT.address, policy: PRICE_IMPROVEMENT_POLICY },
    ]
    // Emulate a server that caps pages below the requested size, forcing the hook to page.
    const paged = fills(fill)
    mockedGetTrades.mockImplementation(async ({ offset = 0 }) => paged.slice(offset, offset + 2))

    const subject = order(appData({ priceImprovementBps: 5000, maxVolumeBps: 100, recipient: PARTNER }))
    const { headline } = await renderBreakdown(subject)

    // The hook paged through every fill (2 + 1, then a terminal empty page), advancing by the records
    // actually returned — so getProtocolFees aggregated across all three fills, not just the first page.
    expect(mockedGetTrades).toHaveBeenCalledTimes(3)
    expect(mockedGetTrades).toHaveBeenLastCalledWith(expect.objectContaining({ orderId: subject.uid, offset: 3 }))

    // Headline folds the native network cost and the WETH protocol fee into one native (ETH) figure,
    // while the USDT partner fee stays as its own per-token total.
    expect(headline).toContain('ETH')
    expect(headline).toContain('USDT')
    expect(headline).not.toContain('WETH')

    expect(screen.getByText('Network costs:')).not.toBeNull()
    expect(screen.getByText('Protocol fee:')).not.toBeNull()
    expect(screen.getByText('Partner price improvement share:')).not.toBeNull()
    // Dropped rather than shown as a "0" row.
    expect(screen.queryByText('Protocol surplus fee:')).toBeNull()
  })

  it('does not report the protocol’s own fees as partner fees', async () => {
    // The second fee is still the protocol's, even though it was applied after the first.
    mockedGetTrades.mockImplementation(async ({ offset = 0 }) =>
      offset === 0
        ? fills(
            [
              { amount: '10000000000000000', token: WETH.address, policy: VOLUME_POLICY },
              { amount: '400000', token: USDT.address, policy: SURPLUS_POLICY },
            ],
            1,
          )
        : [],
    )

    await renderBreakdown(order(appData()))

    expect(screen.getByText('Protocol fee:')).not.toBeNull()
    expect(screen.getByText('Protocol surplus fee:')).not.toBeNull()
    expect(screen.queryByText(/Partner/)).toBeNull()
  })

  it('names fees after their policy alone when there is no app data to attribute them', async () => {
    mockedGetTrades.mockImplementation(async ({ offset = 0 }) =>
      offset === 0 ? fills([{ amount: '10000000000000000', token: WETH.address, policy: VOLUME_POLICY }], 1) : [],
    )

    await renderBreakdown(order(undefined))

    expect(screen.getByText('Volume fee:')).not.toBeNull()
    expect(screen.queryByText(/Partner/)).toBeNull()
    expect(screen.queryByText(/Protocol/)).toBeNull()
  })

  it('numbers rows that would otherwise share a label', async () => {
    // Two partners each taking a volume fee.
    mockedGetTrades.mockImplementation(async ({ offset = 0 }) =>
      offset === 0
        ? fills(
            [
              { amount: '400000', token: USDT.address, policy: VOLUME_POLICY },
              { amount: '500000', token: USDT.address, policy: VOLUME_POLICY },
            ],
            1,
          )
        : [],
    )

    await renderBreakdown(
      order(
        appData([
          { volumeBps: 20, recipient: PARTNER },
          { volumeBps: 20, recipient: '0x2222222222222222222222222222222222222222' },
        ]),
      ),
    )

    expect(screen.getByText('Partner fee 1:')).not.toBeNull()
    expect(screen.getByText('Partner fee 2:')).not.toBeNull()
  })
})
