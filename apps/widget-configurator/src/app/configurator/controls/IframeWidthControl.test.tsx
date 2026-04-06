import { fireEvent, render, screen } from '@testing-library/react'

import { IframeWidthControl } from './IframeWidthControl'

describe('IframeWidthControl', () => {
  it('shows tooltip text explaining what iFrame width controls', () => {
    render(<IframeWidthControl value="" onChange={jest.fn()} />)

    const helpButton = screen.getByLabelText('Explain iFrame width')

    fireEvent.click(helpButton)

    expect(screen.getByRole('tooltip')).not.toBeNull()
    expect(screen.getByText(/outer iFrame element/i)).not.toBeNull()
    expect(screen.getByText(/100% of the available container width/i)).not.toBeNull()
  })

  it('seeds the minimum width when enabling a custom iFrame width', () => {
    const onChange = jest.fn()

    render(<IframeWidthControl value="" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: /custom/i }))

    expect(onChange).toHaveBeenCalledWith('360px')
  })
})
