import React from 'react'

import { render, screen } from '@testing-library/react'
import BigNumber from 'bignumber.js'

import { CostAndFeesItem } from '../../components/orders/DetailsTable/items/CostAndFeesItem'
import { RICH_ORDER } from '../data'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(() => 1),
}))

jest.mock('hooks/useErc20', () => ({
  useMultipleErc20: jest.fn(() => ({ isLoading: false, error: {}, value: {} })),
}))

// Stand-in so the assertions are about what the flag decides, not the tooltip machinery.
jest.mock('../../components/common/DetailRow', () => ({
  DetailRow: ({
    label,
    tooltipText,
    stack,
    children,
  }: {
    label: string
    tooltipText?: React.ReactNode
    stack?: boolean
    children: React.ReactNode
  }): React.ReactNode => (
    <div>
      <span>{label}</span>
      <span data-testid="tooltip">{tooltipText}</span>
      <span data-testid="stack">{String(Boolean(stack))}</span>
      {children}
    </div>
  ),
}))

const { useFlags } = jest.requireMock('launchdarkly-react-client-sdk') as { useFlags: jest.Mock }

// Has everything the breakdown needs, so the flag is the only thing deciding what renders.
const ORDER_WITH_BREAKDOWN = {
  ...RICH_ORDER,
  gasCost: new BigNumber('2500000000000000'),
  protocolFees: [],
}

describe('costs & fees feature flag', () => {
  beforeEach(() => useFlags.mockReset())

  it('renders the pre-feature row when the flag is off, even for an order that could show a breakdown', () => {
    useFlags.mockReturnValue({})

    render(<CostAndFeesItem order={ORDER_WITH_BREAKDOWN} />)

    expect(screen.getByText('Costs & Fees')).not.toBeNull()
    expect(screen.getByTestId('stack').textContent).toBe('false')
    expect(screen.getByTestId('tooltip').textContent).toContain('The amount of fees paid for this order')
    expect(screen.queryByText('Network costs:')).toBeNull()
    expect(screen.queryByText('[+] Show more')).toBeNull()
  })

  it('renders the breakdown row when the flag is on', () => {
    useFlags.mockReturnValue({ isExplorerFeeDisplayEnabled: true })

    render(<CostAndFeesItem order={ORDER_WITH_BREAKDOWN} />)

    expect(screen.getByText('Costs and fees')).not.toBeNull()
    expect(screen.getByTestId('stack').textContent).toBe('true')
    expect(screen.getByTestId('tooltip').textContent).toContain('totaled per token')
  })

  it('falls back to the pre-feature row when the flag is on but the fees are unknown', () => {
    useFlags.mockReturnValue({ isExplorerFeeDisplayEnabled: true })

    render(<CostAndFeesItem order={{ ...ORDER_WITH_BREAKDOWN, protocolFees: undefined }} />)

    expect(screen.queryByText('Network costs:')).toBeNull()
    expect(screen.queryByText('[+] Show more')).toBeNull()
  })
})
