import { fireEvent, render, screen } from '@testing-library/react'

import { ModeControl } from './ModeControl'

describe('ModeControl', () => {
  it('shows tooltip text explaining each widget mode when the help icon is opened', () => {
    render(<ModeControl value="dapp" onChange={jest.fn()} />)

    const helpButton = screen.getByLabelText('Explain widget modes')

    fireEvent.click(helpButton)

    expect(screen.getByRole('tooltip')).not.toBeNull()
    expect(screen.getByText(/dapp mode:/i)).not.toBeNull()
    expect(screen.getByText(/standalone mode:/i)).not.toBeNull()
    expect(screen.getByText(/host app provides the wallet connection/i)).not.toBeNull()
    expect(screen.getByText(/widget uses its own wallet provider/i)).not.toBeNull()
  })
})
