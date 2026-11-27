import { type ReactNode, useState } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { PortfolioFilters } from './PortfolioFilters'

import { NO_PORTFOLIO_FILTER, type PortfolioFilter } from '../lib/portfolioFilter'

import type { RwaAssetSummary, RwaTokenSummary } from '@/entities/asset'

function token(symbol: string, chainId: number, address: string, issuer: string): RwaTokenSummary {
  return { chainId, address, symbol, decimals: 18, issuer }
}

const ASSETS: RwaAssetSummary[] = [
  {
    ticker: 'NVDA',
    title: 'NVIDIA',
    type: 'stock',
    tokens: [
      token('NVDAx', 1, '0x0000000000000000000000000000000000000001', 'xStocks'),
      token('NVDAon', 56, '0x0000000000000000000000000000000000000002', 'Ondo'),
    ],
  },
]

function renderFilters(filter: PortfolioFilter, onChange = jest.fn()): jest.Mock {
  render(<PortfolioFilters assets={ASSETS} filter={filter} onChange={onChange} />)
  return onChange
}

describe('PortfolioFilters', () => {
  it('hides "Reset filters" when no filter is set', () => {
    renderFilters(NO_PORTFOLIO_FILTER)

    expect(screen.queryByRole('button', { name: 'Reset filters' })).toBeNull()
  })

  it.each<[string, PortfolioFilter]>([
    ['issuer', { issuer: 'Ondo', chainId: null }],
    ['network', { issuer: null, chainId: 56 }],
    ['issuer and network', { issuer: 'xStocks', chainId: 1 }],
  ])('resets every filter when the %s filter is set', (_, filter) => {
    const onChange = renderFilters(filter)

    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }))

    expect(onChange).toHaveBeenCalledWith(NO_PORTFOLIO_FILTER)
  })

  it('shows "Reset filters" after the network filter', () => {
    renderFilters({ issuer: 'Ondo', chainId: null })

    const network = screen.getByLabelText('Network')
    const reset = screen.getByRole('button', { name: 'Reset filters' })

    expect(network.compareDocumentPosition(reset) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('moves focus to the network filter when "Reset filters" is used from the keyboard', () => {
    function StatefulFilters(): ReactNode {
      const [filter, setFilter] = useState<PortfolioFilter>({ issuer: 'Ondo', chainId: 56 })

      return <PortfolioFilters assets={ASSETS} filter={filter} onChange={setFilter} />
    }
    render(<StatefulFilters />)
    const reset = screen.getByRole('button', { name: 'Reset filters' })

    reset.focus()
    fireEvent.click(reset)

    expect(screen.queryByRole('button', { name: 'Reset filters' })).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('combobox', { name: 'Network' }))
  })
})
