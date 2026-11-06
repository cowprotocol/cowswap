import { render, screen } from '@testing-library/react'

import { DividendNotes } from './DividendNotes'

describe('DividendNotes', () => {
  it('lists each dividend scheme once, with its issuer and scheme name', () => {
    render(
      <DividendNotes
        tokens={[
          { issuer: 'Ondo' },
          { issuer: 'xStocks', coingeckoId: 'nvidia-xstock' },
          { issuer: 'Ondo' },
          { issuer: 'xStocks', coingeckoId: 'wrapped-nvidia-xstock' },
        ]}
      />,
    )

    expect(screen.getByRole('complementary', { name: 'How dividends reach holders' })).toBeTruthy()
    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
      'OndoPrice accrual',
      'xStocksRebasing',
      'Wrapped xStocksFixed balance',
    ])
  })

  it('renders nothing without a known issuer', () => {
    const { container } = render(<DividendNotes tokens={[{ issuer: 'Dinari' }]} />)

    expect(container.firstChild).toBeNull()
  })
})
