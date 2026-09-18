import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { render, screen } from '@testing-library/react'

import { TradeApproveWithAffectedOrderList } from './TradeApproveWithAffectedOrderList'

import { MAX_APPROVE_AMOUNT } from '../../constants'
import { ApproveRequiredReason } from '../../hooks'

jest.mock('@cowprotocol/wallet', () => ({
  useIsTxBundlingSupported: jest.fn(() => false),
  useWalletDetails: jest.fn(() => ({ allowsOffchainSigning: true })),
}))

const mockUseIsApprovalOrPermitRequired = jest.fn()
const mockUseIsPartialApprovalModeSelected = jest.fn()
const mockUseGetPartialAmountToSignApprove = jest.fn()
const mockUseGetAmountToSignApprove = jest.fn()

jest.mock('../../hooks', () => ({
  ApproveRequiredReason: {
    Unsupported: 'Unsupported',
    NotRequired: 'NotRequired',
    Required: 'Required',
    Eip2612PermitRequired: 'Eip2612PermitRequired',
    DaiLikePermitRequired: 'DaiLikePermitRequired',
    BundleApproveRequired: 'BundleApproveRequired',
  },
  useIsApprovalOrPermitRequired: () => mockUseIsApprovalOrPermitRequired(),
  useIsPartialApprovalModeSelected: () => mockUseIsPartialApprovalModeSelected(),
  useGetPartialAmountToSignApprove: () => mockUseGetPartialAmountToSignApprove(),
  useGetAmountToSignApprove: () => mockUseGetAmountToSignApprove(),
}))

jest.mock('../../state', () => ({
  useSetUserApproveAmountModalState: () => jest.fn(),
}))

jest.mock('../TradeApproveToggle', () => ({
  TradeApproveToggle: () => <div data-testid="trade-approve-toggle" />,
}))

jest.mock('../ActiveOrdersWithAffectedPermit', () => ({
  ActiveOrdersWithAffectedPermit: ({ currency }: { currency: { symbol?: string } }) => (
    <div data-testid="affected-permit-warning">{currency.symbol}</div>
  ),
}))

const TOKEN = new Token(1, '0x0000000000000000000000000000000000000001', 18, 'COW', 'CoW')
const PARTIAL_AMOUNT = CurrencyAmount.fromRawAmount(TOKEN, '1000000000000000000')
const MAX_AMOUNT = CurrencyAmount.fromRawAmount(TOKEN, MAX_APPROVE_AMOUNT.toString())

describe('TradeApproveWithAffectedOrderList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsPartialApprovalModeSelected.mockReturnValue(true)
    mockUseGetPartialAmountToSignApprove.mockReturnValue(PARTIAL_AMOUNT)
    mockUseGetAmountToSignApprove.mockReturnValue(PARTIAL_AMOUNT)
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.NotRequired,
      currentAllowance: 0n,
    })
  })

  it('shows the affected-permit warning for a partial EIP-2612 permit', () => {
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.Eip2612PermitRequired,
      currentAllowance: 0n,
    })

    render(<TradeApproveWithAffectedOrderList />)

    expect(screen.getByTestId('affected-permit-warning').textContent).toBe('COW')
  })

  it('shows the affected-permit warning when forceShowAffectedOrders is set (EOA TWAP)', () => {
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.Required,
      currentAllowance: 0n,
    })

    render(<TradeApproveWithAffectedOrderList forceShowAffectedOrders />)

    expect(screen.getByTestId('affected-permit-warning').textContent).toBe('COW')
  })

  it('does not show the warning for a partial on-chain approve', () => {
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.Required,
      currentAllowance: 0n,
    })

    render(<TradeApproveWithAffectedOrderList />)

    expect(screen.getByTestId('trade-approve-toggle')).not.toBeNull()
    expect(screen.queryByTestId('affected-permit-warning')).toBeNull()
  })

  it('does not show the warning for a partial bundled approve (Safe)', () => {
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.BundleApproveRequired,
      currentAllowance: 0n,
    })

    render(<TradeApproveWithAffectedOrderList />)

    expect(screen.getByTestId('trade-approve-toggle')).not.toBeNull()
    expect(screen.queryByTestId('affected-permit-warning')).toBeNull()
  })

  it('does not show the warning when the user selected unlimited approval', () => {
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.Eip2612PermitRequired,
      currentAllowance: 0n,
    })
    mockUseGetAmountToSignApprove.mockReturnValue(MAX_AMOUNT)

    render(<TradeApproveWithAffectedOrderList />)

    expect(screen.getByTestId('trade-approve-toggle')).not.toBeNull()
    expect(screen.queryByTestId('affected-permit-warning')).toBeNull()
  })

  it('does not show the warning for unlimited approval even when forceShowAffectedOrders is set', () => {
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.Required,
      currentAllowance: 0n,
    })
    mockUseGetAmountToSignApprove.mockReturnValue(MAX_AMOUNT)

    render(<TradeApproveWithAffectedOrderList forceShowAffectedOrders />)

    expect(screen.queryByTestId('affected-permit-warning')).toBeNull()
  })

  it('does not show the warning when no approval or permit is required', () => {
    render(<TradeApproveWithAffectedOrderList />)

    expect(screen.queryByTestId('affected-permit-warning')).toBeNull()
    expect(screen.queryByTestId('trade-approve-toggle')).toBeNull()
  })
})
