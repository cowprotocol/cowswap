import { fireEvent, render, screen } from '@testing-library/react'

import { RowMenu } from './RowMenu'

function renderMenu(): { onSoft: jest.Mock; onHard: jest.Mock } {
  const onSoft = jest.fn()
  const onHard = jest.fn()

  render(
    <RowMenu
      label="Order actions"
      items={[
        { label: 'Cancel order', onSelect: onSoft },
        { label: 'Cancel on-chain', description: 'Costs gas', onSelect: onHard },
      ]}
    />,
  )

  return { onSoft, onHard }
}

describe('RowMenu', () => {
  it('opens on the trigger and runs the selected item', () => {
    const { onSoft, onHard } = renderMenu()
    const trigger = screen.getByRole('button', { name: 'Order actions' })

    expect(screen.queryByRole('menu')).toBe(null)

    fireEvent.click(trigger)

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getAllByRole('menuitem')[0]).toBe(document.activeElement)

    fireEvent.click(screen.getByRole('menuitem', { name: /Cancel on-chain/ }))

    expect(onHard).toHaveBeenCalledTimes(1)
    expect(onSoft).not.toHaveBeenCalled()
    expect(screen.queryByRole('menu')).toBe(null)
  })

  it('moves focus with the arrow keys and closes on Escape', () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Order actions' })

    fireEvent.click(trigger)
    const menu = screen.getByRole('menu')
    const [first, second] = screen.getAllByRole('menuitem')

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(second)

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(first)

    fireEvent.keyDown(menu, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBe(null)
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on a click outside', () => {
    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Order actions' }))
    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('menu')).toBe(null)
  })
})
