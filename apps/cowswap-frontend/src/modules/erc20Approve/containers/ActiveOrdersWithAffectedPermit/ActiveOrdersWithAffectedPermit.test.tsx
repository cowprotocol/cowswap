import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import { Token } from '@cowprotocol/currency'

import { render, screen } from '@testing-library/react'

import { onlyPendingOrdersAtom, pendingEoaTwapOrdersAtom } from 'modules/ordersTable'

import { ActiveOrdersWithAffectedPermit } from './ActiveOrdersWithAffectedPermit'

import { LinguiWrapper } from '../../../../../LinguiJestProvider'

const TOKEN = new Token(1, '0x0000000000000000000000000000000000000001', 18, 'COW', 'CoW')
const POLLER = '0x8c1cdDC5c012A2c84D531855f3946D927FE38E1E'

const mockPendingOrder = {
  id: 'limit-order',
  inputToken: TOKEN,
}

const mockEoaTwapOrder = {
  id: 'eoa-twap-order',
  inputToken: TOKEN,
  isEoaTwapOrder: true,
}

jest.mock('jotai', () => ({
  ...jest.requireActual<typeof import('jotai')>('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('@cowprotocol/balances-and-allowances', () => ({
  useTradeSpenderAddress: jest.fn(() => POLLER),
}))

jest.mock('../../state', () => ({
  useIsPartialApproveSelectedByUser: jest.fn(() => true),
}))

jest.mock('common/utils/doesOrderHavePermit', () => ({
  doesOrderHavePermit: jest.fn((order: { id: string }) => order.id === 'limit-order'),
}))

jest.mock('common/utils/doesOrderUsePollerApproval', () => ({
  doesOrderUsePollerApproval: jest.fn((order: { id: string }) => order.id === 'eoa-twap-order'),
}))

jest.mock('modules/ordersTable', () => ({
  onlyPendingOrdersAtom: Symbol('onlyPendingOrdersAtom'),
  pendingEoaTwapOrdersAtom: Symbol('pendingEoaTwapOrdersAtom'),
  AffectedPermitOrdersTable: () => <div data-testid="affected-orders-table" />,
}))

jest.mock('common/pure/AccordionBanner', () => ({
  AccordionBanner: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <div>
      <div data-testid="banner-title">{title}</div>
      {children}
    </div>
  ),
}))

const mockUseAtomValue = useAtomValue as jest.MockedFunction<typeof useAtomValue>

function renderComponent(approvalTarget?: 'vault-relayer' | 'poller'): ReturnType<typeof render> {
  return render(
    <LinguiWrapper>
      <ActiveOrdersWithAffectedPermit currency={TOKEN} approvalTarget={approvalTarget} />
    </LinguiWrapper>,
  )
}

describe('ActiveOrdersWithAffectedPermit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { useTradeSpenderAddress } = jest.requireMock('@cowprotocol/balances-and-allowances') as {
      useTradeSpenderAddress: jest.Mock
    }
    useTradeSpenderAddress.mockReturnValue(POLLER)
    mockUseAtomValue.mockImplementation((atom) => {
      if (atom === onlyPendingOrdersAtom) return [mockPendingOrder]
      if (atom === pendingEoaTwapOrdersAtom) return [mockEoaTwapOrder]
      return []
    })
  })

  it('shows vault-relayer affected orders with permit-centric footer copy', () => {
    renderComponent('vault-relayer')

    expect(screen.getByTestId('affected-orders-table')).not.toBeNull()
    expect(screen.getByText(/token approval/i)).not.toBeNull()
    expect(screen.queryByText(/allowance for funding/i)).toBeNull()
  })

  it('shows poller affected orders with TWAP funding footer copy', () => {
    renderComponent('poller')

    expect(screen.getByTestId('affected-orders-table')).not.toBeNull()
    expect(screen.getByText(/allowance for funding/i)).not.toBeNull()
    expect(screen.getByText(/other TWAP orders/i)).not.toBeNull()
    expect(screen.queryByText(/token approval/i)).toBeNull()
  })

  it('defaults to vault-relayer mode', () => {
    renderComponent()

    expect(screen.getByText(/token approval/i)).not.toBeNull()
  })

  it('returns null when no affected orders match', () => {
    mockUseAtomValue.mockImplementation((atom) => {
      if (atom === onlyPendingOrdersAtom) return []
      if (atom === pendingEoaTwapOrdersAtom) return []
      return []
    })

    renderComponent('poller')

    expect(screen.queryByTestId('affected-orders-table')).toBeNull()
  })

  it('returns null when poller address is unavailable in poller mode', () => {
    const { useTradeSpenderAddress } = jest.requireMock('@cowprotocol/balances-and-allowances') as {
      useTradeSpenderAddress: jest.Mock
    }
    useTradeSpenderAddress.mockReturnValue(undefined)

    renderComponent('poller')

    expect(screen.queryByTestId('affected-orders-table')).toBeNull()
  })
})
