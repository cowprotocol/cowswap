import { fireEvent, render, screen } from '@testing-library/react'

import { WidgetBorderRadiusControl } from './WidgetBorderRadiusControl'

describe('WidgetBorderRadiusControl', () => {
  it('adds tooltip text explaining what the widget corner radius changes', () => {
    render(<WidgetBorderRadiusControl value="" onChange={jest.fn()} />)

    const helpButton = screen.getByLabelText('Explain Widget corner radius')

    expect(helpButton.getAttribute('title')).toContain('main inner widget card')
    expect(helpButton.getAttribute('title')).toContain('outer iFrame')
  })

  it('seeds the default radius when enabling a custom widget radius', () => {
    const onChange = jest.fn()

    render(<WidgetBorderRadiusControl value="" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: /custom/i }))

    expect(onChange).toHaveBeenCalledWith('24px')
  })
})
