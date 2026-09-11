import type { ReactNode } from 'react'

import { setupI18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'

import { CancellationModal } from './index'

const OWNER = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
const PROXY = '0x1111111111111111111111111111111111111111'
const CUSTOM_RECEIVER = '0x2222222222222222222222222222222222222222'
const i18n = setupI18n({ locale: 'en', messages: { en: {} } })

let mockTwapOrder: { resolvedOwner?: string } | null
const mockOrder = { owner: PROXY, receiver: OWNER, kind: 'sell' }

jest.mock('jotai', () => ({ useAtomValue: () => ({ chainId: 1, orderId: 'twap' }) }))
jest.mock('entities/twap', () => ({ useTwapOrderById: () => mockTwapOrder }))
jest.mock('../../hooks/useUltimateOrder', () => ({
  useUltimateOrder: () => ({ orderFromStore: mockOrder }),
}))
jest.mock('common/hooks/useCancelOrder/state', () => ({ cancellationModalContextAtom: {} }))
jest.mock('../../updaters/orders/utils', () => ({ getUltimateOrderTradeAmounts: () => ({}) }))
jest.mock('common/pure/OrderSummary', () => ({ OrderSummary: () => null }))
jest.mock('common/pure/CancellationModal', () => ({
  CancellationModal: ({ orderSummary }: { orderSummary: ReactNode }) => <>{orderSummary}</>,
}))
jest.mock('legacy/components/ExplorerLink', () => ({
  ExplorerLink: ({ id }: { id: string }) => <a href={id}>receiver address</a>,
}))

beforeEach(() => {
  mockTwapOrder = { resolvedOwner: OWNER }
  mockOrder.owner = PROXY
  mockOrder.receiver = OWNER
})

function renderModal(): void {
  render(
    <I18nProvider i18n={i18n}>
      <CancellationModal isOpen onDismiss={jest.fn()} />
    </I18nProvider>,
  )
}

it.each([OWNER, OWNER.toUpperCase().replace('0X', '0x')])(
  'hides the EOA receiver when it matches the resolved owner: %s',
  (receiver) => {
    mockOrder.receiver = receiver
    renderModal()
    expect(screen.queryByRole('link')).toBeNull()
  },
)

it('shows a custom EOA TWAP receiver', () => {
  mockOrder.receiver = CUSTOM_RECEIVER
  renderModal()
  expect(screen.getByRole('link').getAttribute('href')).toBe(CUSTOM_RECEIVER)
})

it.each([{ resolvedOwner: OWNER }, {}, null])(
  'hides the owner receiver for Safe, legacy Safe, and regular orders: %s',
  (twapOrder) => {
    mockTwapOrder = twapOrder
    mockOrder.owner = OWNER
    renderModal()
    expect(screen.queryByRole('link')).toBeNull()
  },
)

it.each([{ resolvedOwner: OWNER }, {}, null])(
  'preserves custom receivers for Safe, legacy Safe, and regular orders: %s',
  (twapOrder) => {
    mockTwapOrder = twapOrder
    mockOrder.owner = OWNER
    mockOrder.receiver = CUSTOM_RECEIVER
    renderModal()
    expect(screen.getByRole('link').getAttribute('href')).toBe(CUSTOM_RECEIVER)
  },
)
