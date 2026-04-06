import { fireEvent, render, screen } from '@testing-library/react'

import { WidgetPaddingControl } from './WidgetPaddingControl'

const DEFAULT_WIDGET_PADDING = '16px 16px 24px'

describe('WidgetPaddingControl', () => {
  it('reveals the custom input only when custom mode is enabled', () => {
    const onChange = jest.fn()

    render(<WidgetPaddingControl value="" onChange={onChange} />)

    expect(screen.queryByLabelText('Custom widget padding')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Custom' }))

    expect(onChange).toHaveBeenCalledWith(DEFAULT_WIDGET_PADDING)
    expect(screen.getByLabelText('Custom widget padding')).not.toBeNull()
  })

  it('resets back to the default state', () => {
    const onChange = jest.fn()

    render(<WidgetPaddingControl value={DEFAULT_WIDGET_PADDING} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Default' }))

    expect(onChange).toHaveBeenCalledWith('')
  })
})
