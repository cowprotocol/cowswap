import { i18n } from '@lingui/core'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ContextMenuTooltip } from './ContextMenuTooltip'
import { ContextMenuItemButton } from './styled'

i18n.load('en-US', {})
i18n.activate('en-US')

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
    global.IntersectionObserver = jest.fn(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      takeRecords: jest.fn(() => []),
      unobserve: jest.fn(),
    })) as unknown as typeof IntersectionObserver

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

  it('closes when a menu option is clicked', async () => {
    const onOptionClick = jest.fn()

    render(
      <ContextMenuTooltip
        content={<ContextMenuItemButton onClick={onOptionClick}>Order receipt</ContextMenuItemButton>}
      >
        <span>Open menu</span>
      </ContextMenuTooltip>,
    )

    fireEvent.click(screen.getByText('Open menu'))

    const option = screen.getByRole('menuitem', { name: 'Order receipt' })
    const popover = getPopoverContainer(option)

    expect(popover).not.toBeNull()
    await waitFor(() => expect(getComputedStyle(popover as HTMLElement).visibility).toBe('visible'))

    fireEvent.click(option)

    expect(onOptionClick).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(getComputedStyle(popover as HTMLElement).visibility).toBe('hidden'))
  })

  it('supports menu focus, arrow navigation, and isolated Escape dismissal', async () => {
    const onParentKeyDown = jest.fn()

    render(
      <div onKeyDown={onParentKeyDown}>
        <ContextMenuTooltip
          content={
            <>
              <ContextMenuItemButton>First action</ContextMenuItemButton>
              <ContextMenuItemButton>Second action</ContextMenuItemButton>
            </>
          }
        >
          <span>Open menu</span>
        </ContextMenuTooltip>
      </div>,
    )

    const trigger = screen.getByRole('button', { name: 'More options' })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })

    const menu = await screen.findByRole('menu')
    const firstAction = screen.getByRole('menuitem', { name: 'First action' })
    const secondAction = screen.getByRole('menuitem', { name: 'Second action' })

    expect(trigger.getAttribute('aria-controls')).toBe(menu.id)
    await waitFor(() => expect(document.activeElement).toBe(firstAction))

    fireEvent.keyDown(firstAction, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(secondAction)

    fireEvent.keyDown(secondAction, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(firstAction)

    fireEvent.keyDown(firstAction, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(secondAction)

    fireEvent.keyDown(secondAction, { key: 'Home' })
    expect(document.activeElement).toBe(firstAction)

    fireEvent.keyDown(firstAction, { key: 'End' })
    expect(document.activeElement).toBe(secondAction)

    fireEvent.keyDown(secondAction, { key: 'Escape' })

    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(document.activeElement).toBe(trigger)
    expect(onParentKeyDown).not.toHaveBeenCalled()
  })
})
