import { fireEvent, render, screen, within } from '@testing-library/react'

import { Footer } from './Footer'

describe('Footer', () => {
  it('links the CoW products, CoW RWA included, in the bottom row', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: 'CoW Swap' }).getAttribute('href')).toBe('https://swap.cow.fi/')
    expect(screen.getByRole('link', { name: 'CoW Protocol' }).getAttribute('href')).toBe('https://cow.fi/cow-protocol')
    expect(screen.getByRole('link', { name: 'CoW RWA' }).getAttribute('href')).toBe('/')
  })

  it('expands to the CoW DAO links', () => {
    render(<Footer />)

    const toggle = screen.getByRole('button', { name: 'Expand footer' })

    expect(screen.queryByRole('region', { name: 'Products' })).toBeNull()

    fireEvent.click(toggle)

    const products = within(screen.getByRole('region', { name: 'Products' }))

    expect(products.getByRole('link', { name: 'CoW RWA' }).getAttribute('href')).toBe('https://swap.cow.fi/rwa')
    expect(screen.getByRole('link', { name: 'Twitter/X' }).getAttribute('href')).toBe('https://x.com/CoWSwap')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Collapse footer' }))

    expect(screen.queryByRole('region', { name: 'Products' })).toBeNull()
  })
})
