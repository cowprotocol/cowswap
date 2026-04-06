import { fireEvent, render, screen } from '@testing-library/react'

import { WidgetShadowControl } from './WidgetShadowControl'

describe('WidgetShadowControl', () => {
  it('shows the theme default shadow and supports the none option', () => {
    const onChange = jest.fn()

    render(<WidgetShadowControl mode="light" onChange={onChange} value="" />)

    expect(screen.getByText(/theme default: 0 12px 12px rgba\(5, 43, 101, 0.06\)/i)).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'None' }))

    expect(onChange).toHaveBeenCalledWith('none')
  })

  it('reveals the custom input and seeds it from the theme default when needed', () => {
    const onChange = jest.fn()

    render(<WidgetShadowControl mode="dark" onChange={onChange} value="" />)

    fireEvent.click(screen.getByRole('button', { name: 'Custom' }))

    expect(onChange).toHaveBeenCalledWith('0 24px 32px rgba(0, 0, 0, 0.06)')
    expect(screen.getByLabelText('Custom widget shadow')).not.toBeNull()
  })
})
