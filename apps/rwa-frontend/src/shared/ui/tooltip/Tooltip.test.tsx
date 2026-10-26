import { fireEvent, render, screen } from '@testing-library/react'

import { Tooltip } from './Tooltip'

// jsdom has no PointerEvent, so `fireEvent` would drop `pointerType`
class TestPointerEvent extends MouseEvent {
  readonly pointerType: string

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerType = init.pointerType ?? ''
  }
}

describe('Tooltip', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'PointerEvent', { value: TestPointerEvent, configurable: true })
  })

  it('shows on hover and hides when the pointer leaves', () => {
    render(<Tooltip content="Price per share">Quote</Tooltip>)
    const trigger = screen.getByText('Quote')

    expect(screen.queryByRole('tooltip')).toBe(null)

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip.textContent).toBe('Price per share')
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id)

    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' })

    expect(screen.queryByRole('tooltip')).toBe(null)
    expect(trigger.getAttribute('aria-describedby')).toBe(null)
  })

  it('shows while a control inside it has focus', () => {
    render(
      <Tooltip content="Light theme">
        <button type="button">Light</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button', { name: 'Light' })

    fireEvent.focus(button)
    expect(screen.getByRole('tooltip').textContent).toBe('Light theme')

    fireEvent.blur(button)
    expect(screen.queryByRole('tooltip')).toBe(null)
  })

  it('closes on Escape', () => {
    render(<Tooltip content="Hint">Label</Tooltip>)

    fireEvent.pointerEnter(screen.getByText('Label'), { pointerType: 'mouse' })
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('tooltip')).toBe(null)
  })

  it('stays open after a tap until the next tap outside', () => {
    render(<Tooltip content="Hint">Label</Tooltip>)
    const trigger = screen.getByText('Label')

    fireEvent.pointerEnter(trigger, { pointerType: 'touch' })
    fireEvent.pointerLeave(trigger, { pointerType: 'touch' })

    expect(screen.getByRole('tooltip')).toBeTruthy()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('tooltip')).toBe(null)
  })

  it('passes the class name to the trigger', () => {
    render(
      <Tooltip content="Hint" className="secondary">
        Label
      </Tooltip>,
    )

    expect(screen.getByText('Label').className).toContain('secondary')
  })
})
