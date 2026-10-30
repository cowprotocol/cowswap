import { fireEvent, render, screen } from '@testing-library/react'

import { HoldingsTable } from './HoldingsTable'

import type { Holding } from '../lib/holdings'
import type { RwaTokenSummary } from '@/entities/asset'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('@/features/connect-wallet', () => ({ ConnectButton: () => null }))

function token(symbol: string, chainId: number, address: string, issuer: string): RwaTokenSummary {
  return { chainId, address, symbol, decimals: 18, issuer }
}

const NVDAX = token('NVDAx', 1, '0x0000000000000000000000000000000000000001', 'xStocks')
const NVDAON = token('NVDAon', 56, '0x0000000000000000000000000000000000000002', 'Ondo')
const AAPLX = token('AAPLx', 1, '0x0000000000000000000000000000000000000003', 'xStocks')

const HOLDINGS: Holding[] = [
  {
    asset: { ticker: 'NVDA', title: 'NVIDIA', type: 'stock', tokens: [NVDAX, NVDAON] },
    price: 225,
    tokens: [
      { token: NVDAX, balance: '3000000000000000000', shares: 3, value: 675 },
      { token: NVDAON, balance: '2000000000000000000', shares: 2.11, value: 474.65 },
    ],
    shares: 5.11,
    value: 1149.65,
  },
  {
    asset: { ticker: 'AAPL', title: 'Apple', type: 'stock', tokens: [AAPLX] },
    price: null,
    tokens: [{ token: AAPLX, balance: '4000000000000000000', shares: 4, value: null }],
    shares: 4,
    value: null,
  },
]

describe('HoldingsTable', () => {
  it('starts with the tokens of a multi-token asset shown and of a single-token asset hidden', () => {
    render(<HoldingsTable holdings={HOLDINGS} getLogoUrl={() => null} />)

    expect(screen.getByRole('button', { name: 'Hide NVIDIA stock tokens', expanded: true })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Show Apple stock tokens', expanded: false })).toBeTruthy()
    expect(screen.getByText('3.0000 NVDAx')).toBeTruthy()
    expect(screen.getByText('≈ $1,149.65')).toBeTruthy()
    expect(screen.queryByText('4.0000 AAPLx')).toBeNull()
  })

  it('shows a dash without the approximation sign for an unpriced asset, and toggles its tokens', () => {
    render(<HoldingsTable holdings={HOLDINGS} getLogoUrl={() => null} />)

    fireEvent.click(screen.getByRole('button', { name: 'Show Apple stock tokens' }))

    expect(screen.getByText('4.0000 AAPLx')).toBeTruthy()
    expect(screen.getAllByText('—')).toHaveLength(2)
  })
})
