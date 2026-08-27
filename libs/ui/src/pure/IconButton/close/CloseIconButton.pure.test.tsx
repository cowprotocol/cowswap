import { i18n } from '@lingui/core'

import { fireEvent, render, screen } from '@testing-library/react'

import { CloseIconButton } from './CloseIconButton.pure'

import { UI } from '../../../enum'

i18n.load('en-US', {})
i18n.activate('en-US')

describe('CloseIconButton', () => {
  it('uses the shared Feather X and touch target', () => {
    const onClick = jest.fn()

    render(<CloseIconButton aria-label="Close panel" onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Close panel' })
    const icon = button.querySelector('svg')
    const strokes = icon?.querySelectorAll('line')

    expect(getComputedStyle(button).width).toBe('44px')
    expect(getComputedStyle(button).height).toBe('44px')
    expect(button.style.getPropertyValue('--size')).toBe('24px')
    expect(button.style.getPropertyValue('--color')).toBe(`var(${UI.COLOR_TEXT})`)
    expect(icon?.getAttribute('width')).toBe('1em')
    expect(icon?.getAttribute('height')).toBe('1em')
    expect(icon?.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(icon?.getAttribute('stroke')).toBe('currentColor')
    expect(icon?.getAttribute('stroke-width')).toBe('2')
    expect(getComputedStyle(icon as SVGElement).opacity).toBe('0.5')
    expect(strokes).toHaveLength(2)
    expect(Array.from(strokes ?? []).every((stroke) => stroke.getAttribute('opacity') === null)).toBe(true)

    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('uses Close as its default accessible name', () => {
    render(<CloseIconButton onClick={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Close' })).not.toBeNull()
  })

  it('can defer Escape handling to its overlay primitive', () => {
    const onClick = jest.fn()

    render(<CloseIconButton closeOnEscape={false} aria-label="Close panel" onClick={onClick} />)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClick).not.toHaveBeenCalled()
  })
})
