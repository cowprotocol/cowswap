import { fireEvent, render, screen } from '@testing-library/react'

import { OrderActionsCell } from './OrderActionsCell'

import type { OpenOrder } from '../api/openOrders'

jest.mock('../model/useCancelOrder', () => ({
  useCancelOrder: () => jest.fn(),
  useOrderCancellation: () => undefined,
}))

const ORDER_UID = '0xorder'
const TWAP_EVENT_ID = '1'.repeat(70)

function openMenu(openOrder: OpenOrder): void {
  render(<OrderActionsCell order={openOrder} />)
  fireEvent.click(screen.getByRole('button', { name: 'Order actions' }))
}

function order(overrides: Partial<OpenOrder>): OpenOrder {
  return { uid: ORDER_UID, chainId: 8453, type: 'limit', isSoftCancellable: true, ...overrides } as OpenOrder
}

describe('OrderActionsCell', () => {
  it('opens the order on CoW Explorer', () => {
    const open = jest.spyOn(window, 'open').mockReturnValue(null)
    openMenu(order({}))

    fireEvent.click(screen.getByRole('menuitem', { name: /View order details/ }))

    expect(open).toHaveBeenCalledWith(
      `https://explorer.cow.fi/base/orders/${ORDER_UID}`,
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('warns that a solver may still fill a cancelled order', () => {
    openMenu(order({}))

    expect(screen.getByRole('menuitem', { name: /Cancel order/ }).textContent).toContain(
      'Off-chain cancellations require a signature and are free. Keep in mind a solver might already have included',
    )
    expect(screen.getByRole('menuitem', { name: /Cancel on-chain/ }).textContent).toContain(
      'On-chain cancellations require a regular on-chain transaction and cost gas. Keep in mind a solver might',
    )
  })

  it('links a Safe TWAP, which is cancelled in the widget, without cancel actions', () => {
    openMenu(order({ type: 'twap', uid: TWAP_EVENT_ID }))

    expect(screen.getAllByRole('menuitem').map(({ textContent }) => textContent)).toEqual(['View order details'])
  })
})
