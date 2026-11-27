import { useIsTxBundlingSupported, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { ApproveRequiredReason, useIsApprovalOrPermitRequired } from 'modules/erc20Approve'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'

import { useAmountsToSignFromQuote } from './useAmountsToSignFromQuote'
import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'
import { useIsEoaEthFlow } from './useIsEoaEthFlow'
import { useIsWaitAndSaveAvailable } from './useIsWaitAndSaveAvailable'

jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: () => ({ isWaitForCowsEnabled: true }) }))
jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(() => ({ chainId: 59144 })),
  useWalletDetails: jest.fn(() => ({ allowsOffchainSigning: false })),
  useIsTxBundlingSupported: jest.fn(() => false),
}))
jest.mock('entities/injectedWidget', () => ({ useInjectedWidgetParams: () => ({}) }))
jest.mock('common/hooks/useIsProviderNetworkDeprecated', () => ({ useIsProviderNetworkDeprecated: jest.fn() }))
jest.mock('common/hooks/useIsSafeApprovalBundle', () => ({ useIsSafeApprovalBundle: jest.fn() }))
jest.mock('modules/erc20Approve', () => ({
  ApproveRequiredReason: {
    Unsupported: 0,
    NotRequired: 1,
    Required: 2,
    Eip2612PermitRequired: 3,
    DaiLikePermitRequired: 4,
    BundleApproveRequired: 5,
  },
  useIsApprovalOrPermitRequired: jest.fn(),
}))
jest.mock('./useIsCurrentTradeBridging', () => ({ useIsCurrentTradeBridging: jest.fn() }))
jest.mock('./useIsEoaEthFlow', () => ({ useIsEoaEthFlow: jest.fn() }))
jest.mock('./useAmountsToSignFromQuote', () => ({ useAmountsToSignFromQuote: jest.fn() }))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseWalletDetails = useWalletDetails as jest.MockedFunction<typeof useWalletDetails>
const mockUseIsTxBundlingSupported = useIsTxBundlingSupported as jest.MockedFunction<typeof useIsTxBundlingSupported>
const mockUseIsProviderNetworkDeprecated = useIsProviderNetworkDeprecated as jest.MockedFunction<
  typeof useIsProviderNetworkDeprecated
>
const mockUseIsSafeApprovalBundle = useIsSafeApprovalBundle as jest.MockedFunction<typeof useIsSafeApprovalBundle>
const mockUseIsApprovalOrPermitRequired = useIsApprovalOrPermitRequired as jest.MockedFunction<
  typeof useIsApprovalOrPermitRequired
>
const mockUseIsCurrentTradeBridging = useIsCurrentTradeBridging as jest.MockedFunction<typeof useIsCurrentTradeBridging>
const mockUseIsEoaEthFlow = useIsEoaEthFlow as jest.MockedFunction<typeof useIsEoaEthFlow>
const mockUseAmountsToSignFromQuote = useAmountsToSignFromQuote as jest.MockedFunction<typeof useAmountsToSignFromQuote>

describe('useIsWaitAndSaveAvailable', () => {
  beforeEach(() => {
    mockUseWalletInfo.mockReturnValue({ chainId: 59144 })
    mockUseWalletDetails.mockReturnValue({ allowsOffchainSigning: false } as ReturnType<typeof useWalletDetails>)
    mockUseIsTxBundlingSupported.mockReturnValue(false)
    mockUseIsCurrentTradeBridging.mockReturnValue(false)
    mockUseIsProviderNetworkDeprecated.mockReturnValue(false)
    mockUseIsEoaEthFlow.mockReturnValue(false)
    mockUseAmountsToSignFromQuote.mockReturnValue(null)
    mockUseIsSafeApprovalBundle.mockReturnValue(false)
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.NotRequired,
      currentAllowance: undefined,
    })
  })

  it('is available on an active network', () => {
    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(true)
  })

  it('is not available on a deprecated network', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(true)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(false)
  })

  it('is not available for a bridge order', () => {
    mockUseIsCurrentTradeBridging.mockReturnValue(true)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(false)
  })

  it('stays available before a wallet connects, even though off-chain signing defaults to false', () => {
    mockUseWalletInfo.mockReturnValue({ chainId: 59144 })
    mockUseWalletDetails.mockReturnValue({ allowsOffchainSigning: false } as ReturnType<typeof useWalletDetails>)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(true)
  })

  it('is available for a connected wallet that can sign off-chain', () => {
    mockUseWalletInfo.mockReturnValue({ chainId: 59144, account: '0xabc' })
    mockUseWalletDetails.mockReturnValue({ allowsOffchainSigning: true } as ReturnType<typeof useWalletDetails>)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(true)
  })

  it('is not available for a connected wallet that will presign', () => {
    mockUseWalletInfo.mockReturnValue({ chainId: 59144, account: '0xabc' })
    mockUseWalletDetails.mockReturnValue({ allowsOffchainSigning: false } as ReturnType<typeof useWalletDetails>)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(false)
  })

  it('stays available for EOA ETH-flow, which signs EIP-1271', () => {
    mockUseWalletInfo.mockReturnValue({ chainId: 59144, account: '0xabc' })
    mockUseWalletDetails.mockReturnValue({ allowsOffchainSigning: true } as ReturnType<typeof useWalletDetails>)
    mockUseIsEoaEthFlow.mockReturnValue(true)
    mockUseIsSafeApprovalBundle.mockReturnValue(true)

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(true)
  })

  it('is not available for a Safe approval bundle that is not a permit', () => {
    mockUseWalletInfo.mockReturnValue({ chainId: 59144, account: '0xabc' })
    mockUseWalletDetails.mockReturnValue({ allowsOffchainSigning: true } as ReturnType<typeof useWalletDetails>)
    mockUseIsSafeApprovalBundle.mockReturnValue(true)
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.BundleApproveRequired,
      currentAllowance: undefined,
    })

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(false)
  })

  it('stays available when the Safe bundle will use a permit instead of presign', () => {
    mockUseWalletInfo.mockReturnValue({ chainId: 59144, account: '0xabc' })
    mockUseWalletDetails.mockReturnValue({ allowsOffchainSigning: true } as ReturnType<typeof useWalletDetails>)
    mockUseIsSafeApprovalBundle.mockReturnValue(true)
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.Eip2612PermitRequired,
      currentAllowance: undefined,
    })

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(true)
  })

  it('is not available when a connected wallet cannot sign off-chain, even with a dai-like permit', () => {
    mockUseWalletInfo.mockReturnValue({ chainId: 59144, account: '0xabc' })
    mockUseWalletDetails.mockReturnValue({ allowsOffchainSigning: false } as ReturnType<typeof useWalletDetails>)
    mockUseIsSafeApprovalBundle.mockReturnValue(true)
    mockUseIsApprovalOrPermitRequired.mockReturnValue({
      reason: ApproveRequiredReason.DaiLikePermitRequired,
      currentAllowance: undefined,
    })

    expect(renderHook(() => useIsWaitAndSaveAvailable()).result.current).toBe(false)
  })
})
