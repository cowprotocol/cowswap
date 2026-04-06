import { fireEvent, render, screen } from '@testing-library/react'

import { IframeBorderRadiusControl } from './IframeBorderRadiusControl'

describe('IframeBorderRadiusControl', () => {
  it('adds tooltip text explaining what the iFrame border radius changes', () => {
    render(<IframeBorderRadiusControl value="1.6rem" onChange={jest.fn()} />)

    const helpButton = screen.getByLabelText('Explain iFrame border radius')

    expect(helpButton.getAttribute('title')).toContain('outer iFrame element')
    expect(helpButton.getAttribute('title')).toContain('inner widget card radius')
  })

  it('seeds a flush embed radius when enabling a custom iFrame radius', () => {
    const onChange = jest.fn()

    render(<IframeBorderRadiusControl value="1.6rem" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: /custom/i }))

    expect(onChange).toHaveBeenCalledWith('0')
  })
})
