import { fireEvent, render, screen } from '@testing-library/react'

import { OrderActionsCell } from './OrderActionsCell'

import type { OpenOrder } from '../api/openOrders'

const mockCancel = jest.fn()

jest.mock('../model/useCancelOrder', () => ({
  useCancelOrder: () => mockCancel,
  useOrderCancellation: () => undefined,
}))

afterEach(() => mockCancel.mockReset())

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

    fireEvent.click(screen.getByRole('menuitem', { name: /View on explorer/ }))

    expect(open).toHaveBeenCalledWith(
      `https://explorer.cow.fi/base/orders/${ORDER_UID}`,
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('warns that a solver may still fill a cancelled order', () => {
    openMenu(order({}))

    expect(screen.getByRole('menuitem', { name: /Cancel off-chain/ }).textContent).toContain(
      'Requires a signature and is free.\nKeep in mind a solver might already have included',
    )
    expect(screen.getByRole('menuitem', { name: /Cancel on-chain/ }).textContent).toContain(
      'Requires an on-chain transaction and costs gas.\nKeep in mind a solver might',
    )
  })

  it.each([
    ['Cancel off-chain', 'soft'],
    ['Cancel on-chain', 'hard'],
  ])('runs the matching cancellation for %s', (label, type) => {
    const limitOrder = order({})
    openMenu(limitOrder)

    fireEvent.click(screen.getByRole('menuitem', { name: new RegExp(label) }))

    expect(mockCancel).toHaveBeenCalledWith(limitOrder, type)
  })

  it('offers only the on-chain cancellation for an order that cannot be cancelled off-chain', () => {
    openMenu(order({ isSoftCancellable: false }))

    expect(screen.queryByRole('menuitem', { name: /Cancel off-chain/ })).toBeNull()
    expect(screen.getByRole('menuitem', { name: /Cancel on-chain/ })).toBeTruthy()
  })

  it('cancels a TWAP of an EOA on-chain', () => {
    const twap = order({
      type: 'twap',
      uid: TWAP_EVENT_ID,
      cowShedTwap: { eventId: TWAP_EVENT_ID, hash: '0x1', cowShedAddress: '0x2' },
    })
    openMenu(twap)

    expect(screen.getAllByRole('menuitem').map(({ textContent }) => textContent?.split('Requires')[0])).toEqual([
      'View on explorer',
      'Cancel on-chain',
    ])

    fireEvent.click(screen.getByRole('menuitem', { name: /Cancel on-chain/ }))

    expect(mockCancel).toHaveBeenCalledWith(twap, 'hard')
  })

  it('links a Safe TWAP, which is cancelled in the widget, without cancel actions', () => {
    const open = jest.spyOn(window, 'open').mockReturnValue(null)
    openMenu(order({ type: 'twap', uid: TWAP_EVENT_ID }))

    expect(screen.getAllByRole('menuitem').map(({ textContent }) => textContent)).toEqual(['View on explorer'])

    fireEvent.click(screen.getByRole('menuitem', { name: 'View on explorer' }))

    expect(open).toHaveBeenCalledWith(
      `https://explorer.cow.fi/base/twap/${TWAP_EVENT_ID}`,
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('links a TWAP part, listed when the TWAPs fail to load, to its order', () => {
    const open = jest.spyOn(window, 'open').mockReturnValue(null)
    openMenu(order({ type: 'twap', uid: ORDER_UID }))

    fireEvent.click(screen.getByRole('menuitem', { name: 'View on explorer' }))

    expect(open).toHaveBeenCalledWith(
      `https://explorer.cow.fi/base/orders/${ORDER_UID}`,
      '_blank',
      'noopener,noreferrer',
    )
  })
})
