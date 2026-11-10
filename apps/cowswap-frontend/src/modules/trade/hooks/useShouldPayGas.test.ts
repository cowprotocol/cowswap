import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletDetails, useWalletInfo, WalletDetails, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useIsEoaEthFlow } from './useIsEoaEthFlow'
import { useShouldPayGas } from './useShouldPayGas'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
  useWalletDetails: jest.fn(),
}))

jest.mock('./useIsEoaEthFlow', () => ({
  useIsEoaEthFlow: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseWalletDetails = useWalletDetails as jest.MockedFunction<typeof useWalletDetails>
const mockUseIsEoaEthFlow = useIsEoaEthFlow as jest.MockedFunction<typeof useIsEoaEthFlow>

const ACCOUNT = '0x0000000000000000000000000000000000000001'

interface Scenario {
  chainId?: SupportedChainId
  account?: string
  allowsOffchainSigning: boolean
  isEoaEthFlow?: boolean
}

function renderShouldPayGas({
  chainId = SupportedChainId.MAINNET,
  account,
  allowsOffchainSigning,
  isEoaEthFlow = false,
}: Scenario): boolean {
  mockUseWalletInfo.mockReturnValue({ chainId, account } as WalletInfo)
  mockUseWalletDetails.mockReturnValue({ allowsOffchainSigning } as WalletDetails)
  mockUseIsEoaEthFlow.mockReturnValue(isEoaEthFlow)

  return renderHook(() => useShouldPayGas()).result.current
}

describe('useShouldPayGas', () => {
  it('returns false when no wallet is connected', () => {
    expect(renderShouldPayGas({ account: undefined, allowsOffchainSigning: false })).toBe(false)
  })

  it('returns false on Solana', () => {
    expect(
      renderShouldPayGas({ chainId: SupportedChainId.SOLANA, account: ACCOUNT, allowsOffchainSigning: false }),
    ).toBe(false)
  })

  it('returns false for an EOA', () => {
    expect(renderShouldPayGas({ account: ACCOUNT, allowsOffchainSigning: true })).toBe(false)
  })

  it('returns true for an EOA ETH-flow order', () => {
    expect(renderShouldPayGas({ account: ACCOUNT, allowsOffchainSigning: true, isEoaEthFlow: true })).toBe(true)
  })

  it('returns true for a smart contract wallet without off-chain signing', () => {
    expect(renderShouldPayGas({ account: ACCOUNT, allowsOffchainSigning: false })).toBe(true)
  })
})
