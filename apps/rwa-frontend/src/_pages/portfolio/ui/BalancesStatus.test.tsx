import { fireEvent, render, screen } from '@testing-library/react'

import { BalancesStatus } from './BalancesStatus'

import type { BalancesProgress } from '../model/usePortfolio'

const LOADED: BalancesProgress = { loaded: 8, total: 8, isLoading: false, updatedAt: Date.UTC(2026, 9, 5, 12, 0) }

describe('BalancesStatus', () => {
  it('shows how many networks have loaded', () => {
    render(<BalancesStatus progress={{ ...LOADED, loaded: 3, isLoading: true }} onRefresh={jest.fn()} />)

    const progressbar = screen.getByRole('progressbar', { name: 'Loading balances' })

    expect(progressbar.getAttribute('aria-valuenow')).toBe('3')
    expect(progressbar.getAttribute('aria-valuemax')).toBe('8')
    expect(screen.getByText('Loading balances · 3 of 8 networks')).toBeTruthy()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Refresh balances' }).disabled).toBe(true)
  })

  it('shows the update time and refreshes on click once loaded', () => {
    const onRefresh = jest.fn()
    render(<BalancesStatus progress={LOADED} onRefresh={onRefresh} />)

    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.getByText(/^Balances updated /)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Refresh balances' }))

    expect(onRefresh).toHaveBeenCalledTimes(1)
  })
})
