import { fireEvent, render, screen, within } from '@testing-library/react'

import { Footer } from './Footer'

describe('Footer', () => {
  it('links the CoW products in the bottom row', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: 'CoW Swap' }).getAttribute('href')).toBe('https://swap.cow.fi/')
    expect(screen.getByRole('link', { name: 'CoW Protocol' }).getAttribute('href')).toBe('https://cow.fi/cow-protocol')
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('expands to the CoW DAO links', () => {
    render(<Footer />)

    const toggle = screen.getByRole('button', { name: 'Expand footer' })

    expect(screen.queryByRole('region', { name: 'Products' })).toBeNull()

    fireEvent.click(toggle)

    const products = within(screen.getByRole('region', { name: 'Products' }))

    expect(products.getByRole('link', { name: 'Stocks' }).getAttribute('href')).toBe('https://swap.cow.fi/rwa')
    expect(screen.getByRole('link', { name: 'Twitter/X' }).getAttribute('href')).toBe('https://x.com/CoWSwap')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Collapse footer' }))

    expect(screen.queryByRole('region', { name: 'Products' })).toBeNull()
  })
})
