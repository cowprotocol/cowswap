import { fireEvent, render, screen } from '@testing-library/react'

import { HeaderMobileMenu } from './HeaderMobileMenu'

jest.mock('next/navigation', () => ({ usePathname: () => '/portfolio' }))

describe('HeaderMobileMenu', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({ matches: true, addEventListener: () => undefined, removeEventListener: () => undefined }),
    })
  })

  it('lists the pages and the legal links, and locks the page scroll while open', () => {
    render(<HeaderMobileMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

    expect(screen.getByRole('link', { name: 'Portfolio' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Explore' }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByRole('link', { name: 'Swap' })).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')
    expect(screen.queryByRole('link', { name: 'Terms and Conditions' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'More' }))

    expect(screen.getByRole('link', { name: 'Terms and Conditions' }).getAttribute('href')).toBe(
      'https://cow.fi/legal/cowswap-terms',
    )
  })

  it('closes on Escape and returns the focus to the button', () => {
    render(<HeaderMobileMenu />)

    const trigger = screen.getByRole('button', { name: 'Menu' })

    fireEvent.click(trigger)
    fireEvent.keyDown(screen.getByRole('link', { name: 'Explore' }), { key: 'Escape' })

    expect(screen.queryByRole('navigation')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(trigger)
  })
})
