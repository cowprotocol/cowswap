import { fireEvent, render, screen } from '@testing-library/react'

import { BooleanSwitchControl } from './BooleanSwitchControl'

describe('BooleanSwitchControl', () => {
  it('renders label and helper text', () => {
    render(
      <BooleanSwitchControl
        checked={false}
        label="Show orders table"
        helperText="Shows the orders tab."
        onChange={jest.fn()}
      />,
    )

    expect(screen.getByText('Show orders table')).not.toBeNull()
    expect(screen.getByText('Shows the orders tab.')).not.toBeNull()
  })

  it('passes the next checked state to the handler', () => {
    const onChange = jest.fn()

    render(<BooleanSwitchControl checked={false} label="Show orders table" onChange={onChange} />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Show orders table' }))

    expect(onChange).toHaveBeenCalledWith(true)
  })
})
