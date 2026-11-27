import { isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useAffiliateChainId } from './useAffiliateChainId'
import { TraderWalletStatus, useAffiliateTraderWallet } from './useAffiliateTraderWallet'
import { useIsRefCodeExpired } from './useIsRefCodeExpired'
import { useIsRewardsRowEnabled } from './useIsRewardsRowEnabled'

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  isInjectedWidget: jest.fn(),
}))

jest.mock('./useAffiliateChainId', () => ({
  useAffiliateChainId: jest.fn(),
}))

jest.mock('./useAffiliateTraderWallet', () => ({
  TraderWalletStatus: {
    DISCONNECTED: 'disconnected',
    UNSUPPORTED: 'unsupported',
    INELIGIBLE: 'ineligible',
  },
  useAffiliateTraderWallet: jest.fn(),
}))

jest.mock('./useIsRefCodeExpired', () => ({
  useIsRefCodeExpired: jest.fn(),
}))

const isInjectedWidgetMock = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>
const useAffiliateChainIdMock = useAffiliateChainId as jest.MockedFunction<typeof useAffiliateChainId>
const useAffiliateTraderWalletMock = useAffiliateTraderWallet as jest.MockedFunction<typeof useAffiliateTraderWallet>
const useIsRefCodeExpiredMock = useIsRefCodeExpired as jest.MockedFunction<typeof useIsRefCodeExpired>

describe('useIsRewardsRowEnabled', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    isInjectedWidgetMock.mockReturnValue(false)
    useIsRefCodeExpiredMock.mockReturnValue(false)
  })

  it('returns false on Solana when the wallet is disconnected', () => {
    useAffiliateChainIdMock.mockReturnValue(SupportedChainId.SOLANA)
    useAffiliateTraderWalletMock.mockReturnValue(TraderWalletStatus.DISCONNECTED)

    const { result } = renderHook(() => useIsRewardsRowEnabled())

    expect(result.current).toBe(false)
  })

  it('returns true on an EVM network when the wallet is disconnected', () => {
    useAffiliateChainIdMock.mockReturnValue(SupportedChainId.MAINNET)
    useAffiliateTraderWalletMock.mockReturnValue(TraderWalletStatus.DISCONNECTED)

    const { result } = renderHook(() => useIsRewardsRowEnabled())

    expect(result.current).toBe(true)
  })
})
