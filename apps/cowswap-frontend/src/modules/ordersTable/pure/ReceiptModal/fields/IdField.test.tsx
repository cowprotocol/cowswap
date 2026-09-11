import { render, screen } from '@testing-library/react'

import { IdField } from './IdField'

describe('IdField', () => {
  it.each([
    ['1'.repeat(70), 'https://explorer.cow.fi/gc/twap/123'],
    [`0x${'a'.repeat(112)}`, 'https://explorer.cow.fi/gc/orders/123'],
    [`0x${'b'.repeat(64)}`, 'https://gnosisscan.io/tx/123'],
  ])('uses the supplied destination for %s', (id, href) => {
    render(<IdField id={id} chainId={1} href={href} />)

    expect(screen.getByRole('link').getAttribute('href')).toBe(href)
  })
})
