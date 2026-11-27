import { fireEvent, renderHook } from '@testing-library/react'

import { useDismissOnEscape } from './useDismissOnEscape'

interface TestOverlay {
  close: jest.Mock
  trigger: HTMLButtonElement
  setIsOpen(isOpen: boolean): void
}

function openOverlay(options?: { capture: boolean }): TestOverlay {
  const close = jest.fn()
  const trigger = document.body.appendChild(document.createElement('button'))
  const triggerRef = { current: trigger }
  const { rerender } = renderHook(({ isOpen }) => useDismissOnEscape(isOpen, close, triggerRef, options), {
    initialProps: { isOpen: true },
  })

  return { close, trigger, setIsOpen: (isOpen) => rerender({ isOpen }) }
}

describe('useDismissOnEscape', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('closes the overlay opened last, then the one beneath it', () => {
    const first = openOverlay()
    const last = openOverlay()

    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect(last.close).toHaveBeenCalledTimes(1)
    expect(first.close).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(last.trigger)

    last.setIsOpen(false)
    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect(first.close).toHaveBeenCalledTimes(1)
    expect(last.close).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(first.trigger)
  })

  it('takes the Escape before the control with the focus when capturing', () => {
    const overlay = openOverlay({ capture: true })
    const input = document.body.appendChild(document.createElement('input'))
    input.addEventListener('keydown', (event) => event.preventDefault())

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(overlay.close).toHaveBeenCalledTimes(1)
  })

  it('leaves an Escape that a control already handled', () => {
    const overlay = openOverlay()
    const input = document.body.appendChild(document.createElement('input'))
    input.addEventListener('keydown', (event) => event.preventDefault())

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(overlay.close).not.toHaveBeenCalled()
  })

  it('ignores other keys', () => {
    const overlay = openOverlay()

    fireEvent.keyDown(document.body, { key: 'Enter' })

    expect(overlay.close).not.toHaveBeenCalled()
  })
})
