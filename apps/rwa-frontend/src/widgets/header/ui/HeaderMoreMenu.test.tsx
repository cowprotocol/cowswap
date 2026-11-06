import { fireEvent, render, screen } from '@testing-library/react'

import { HeaderMoreMenu } from './HeaderMoreMenu'

describe('HeaderMoreMenu', () => {
  it('opens the legal links and closes on Escape', () => {
    render(<HeaderMoreMenu />)

    const trigger = screen.getByRole('button', { name: 'More' })

    expect(screen.queryByRole('link')).toBeNull()

    fireEvent.click(trigger)

    const legal = screen.getByRole('region', { name: 'Legal' })

    expect(legal).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Terms and Conditions' }).getAttribute('href')).toBe(
      'https://cow.fi/legal/cowswap-terms',
    )
    expect(screen.getByRole('link', { name: 'Privacy Policy' }).getAttribute('href')).toBe(
      'https://cow.fi/legal/cowswap-privacy-policy',
    )
    expect(screen.getByRole('link', { name: 'Cookie Policy' }).getAttribute('href')).toBe(
      'https://cow.fi/legal/cowswap-cookie-policy',
    )

    fireEvent.keyDown(legal, { key: 'Escape' })

    expect(screen.queryByRole('link')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})
