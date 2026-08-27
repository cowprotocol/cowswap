import { fireEvent, render, screen } from '@testing-library/react'

import { ContextMenuTooltip } from './ContextMenuTooltip'
import { ContextMenuItemButton } from './styled'

function getPopoverContainer(from: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = from

  while (current) {
    if (current.style.zIndex === '999999') {
      return current
    }
    current = current.parentElement
  }

  return null
}

describe('ContextMenuTooltip', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    })
  })

  it('closes when a menu option is clicked', () => {
    const onOptionClick = jest.fn()

    render(
      <ContextMenuTooltip
        content={<ContextMenuItemButton onClick={onOptionClick}>Order receipt</ContextMenuItemButton>}
      >
        <span>Open menu</span>
      </ContextMenuTooltip>,
    )

    fireEvent.click(screen.getByText('Open menu'))

    const option = screen.getByRole('button', { name: 'Order receipt' })
    const popover = getPopoverContainer(option)

    expect(popover).not.toBeNull()
    expect(getComputedStyle(popover as HTMLElement).visibility).toBe('visible')

    fireEvent.click(option)

    expect(onOptionClick).toHaveBeenCalledTimes(1)
    expect(getComputedStyle(popover as HTMLElement).visibility).toBe('hidden')
  })
})
