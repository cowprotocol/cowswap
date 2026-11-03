import { fireEvent, render, screen } from '@testing-library/react'

import { ProductsMenu } from './ProductsMenu'

describe('ProductsMenu', () => {
  it('lists the CoW products with CoW RWA as the current one, and closes on Escape', () => {
    render(<ProductsMenu />)

    const trigger = screen.getByRole('button', { name: 'CoW products' })

    expect(screen.queryByRole('link')).toBeNull()

    fireEvent.click(trigger)

    const links = screen.getAllByRole('link')

    expect(links.map((link) => link.textContent)).toEqual(['CoW DAO', 'CoW Swap', 'CoW Protocol', 'CoW RWA'])
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://cow.fi/',
      'https://swap.cow.fi/',
      'https://cow.fi/cow-protocol',
      '/',
    ])
    expect(links.slice(0, 3).every((link) => link.getAttribute('target') === '_blank')).toBe(true)

    const current = screen.getByRole('link', { name: 'CoW RWA' })

    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.getAttribute('target')).toBeNull()

    fireEvent.keyDown(current, { key: 'Escape' })

    expect(screen.queryByRole('link')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes when a product is picked', () => {
    render(<ProductsMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'CoW products' }))
    fireEvent.click(screen.getByRole('link', { name: 'CoW Swap' }))

    expect(screen.queryByRole('link')).toBeNull()
  })
})
