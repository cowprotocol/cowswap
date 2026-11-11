import { render } from '@testing-library/react'

import { GasPaymentReason, useGasPaymentReason } from 'modules/trade'

import { NetworkCostsTooltipSuffix } from './NetworkCostsTooltipSuffix'

jest.mock('modules/trade', () => ({
  GasPaymentReason: {
    EthFlow: 'eth-flow',
    SmartContractWallet: 'smart-contract-wallet',
  },
  useGasPaymentReason: jest.fn(),
}))

jest.mock('lib/hooks/useNativeCurrency', () => ({ __esModule: true, default: () => ({ symbol: 'ETH' }) }))

const mockUseGasPaymentReason = jest.mocked(useGasPaymentReason)

describe('NetworkCostsTooltipSuffix', () => {
  it('renders nothing when no gas is paid', () => {
    mockUseGasPaymentReason.mockReturnValue(null)

    const { container } = render(<NetworkCostsTooltipSuffix />)

    expect(container.textContent).toBe('')
  })

  it('explains the native currency sell for eth-flow', () => {
    mockUseGasPaymentReason.mockReturnValue(GasPaymentReason.EthFlow)

    const { container } = render(<NetworkCostsTooltipSuffix />)

    expect(container.textContent).toContain(
      'Because you are selling ETH (native currency), you will pay a separate gas cost for signing the order placement on-chain.',
    )
  })

  it('explains the smart contract wallet for wallets without off-chain signing', () => {
    mockUseGasPaymentReason.mockReturnValue(GasPaymentReason.SmartContractWallet)

    const { container } = render(<NetworkCostsTooltipSuffix />)

    expect(container.textContent).toContain(
      'Because you are using a smart contract wallet, you will pay a separate gas cost for signing the order placement on-chain.',
    )
  })
})
