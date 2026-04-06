import { fireEvent, render, screen } from '@testing-library/react'

import { IframeBackgroundColorControl } from './IframeBackgroundColorControl'

jest.mock('mui-color-input', () => ({
  MuiColorInput: (props: { label: string; onChange: (value: string) => void; value: string }) => (
    <input aria-label={props.label} value={props.value} onChange={(event) => props.onChange(event.target.value)} />
  ),
}))

describe('IframeBackgroundColorControl', () => {
  it('adds tooltip text explaining what the iFrame background color changes', () => {
    render(<IframeBackgroundColorControl defaultCustomColor="#ffffff" value="" onChange={jest.fn()} />)

    const helpButton = screen.getByLabelText('Explain iFrame background color')

    expect(helpButton.getAttribute('title')).toContain('outer iFrame element')
    expect(helpButton.getAttribute('title')).toContain('transparent')
  })

  it('seeds the custom color when enabling a custom iFrame background', () => {
    const onChange = jest.fn()

    render(<IframeBackgroundColorControl defaultCustomColor="#ffffff" value="" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: /custom/i }))

    expect(onChange).toHaveBeenCalledWith('#ffffff')
  })
})
