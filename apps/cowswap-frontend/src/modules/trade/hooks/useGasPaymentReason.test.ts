import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletDetails, useWalletInfo, WalletDetails, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { GasPaymentReason, useGasPaymentReason } from './useGasPaymentReason'
import { useIsEoaEthFlow } from './useIsEoaEthFlow'
import { useIsSwapEth } from './useIsSwapEth'
import { useShouldPayGas } from './useShouldPayGas'

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
  useWalletDetails: jest.fn(),
}))

jest.mock('./useIsEoaEthFlow', () => ({
  useIsEoaEthFlow: jest.fn(),
}))

jest.mock('./useIsSwapEth', () => ({
  useIsSwapEth: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseWalletDetails = useWalletDetails as jest.MockedFunction<typeof useWalletDetails>
const mockUseIsEoaEthFlow = useIsEoaEthFlow as jest.MockedFunction<typeof useIsEoaEthFlow>
const mockUseIsSwapEth = useIsSwapEth as jest.MockedFunction<typeof useIsSwapEth>

const ACCOUNT = '0x0000000000000000000000000000000000000001'

interface Scenario {
  chainId?: SupportedChainId
  account?: string
  allowsOffchainSigning: boolean
  isEoaEthFlow?: boolean
  isSwapEth?: boolean
}

interface ScenarioResult {
  reason: GasPaymentReason | null
  shouldPayGas: boolean
}

function renderScenario({
  chainId = SupportedChainId.MAINNET,
  account,
  allowsOffchainSigning,
  isEoaEthFlow = false,
  isSwapEth = false,
}: Scenario): ScenarioResult {
  mockUseWalletInfo.mockReturnValue({ chainId, account } as WalletInfo)
  mockUseWalletDetails.mockReturnValue({ allowsOffchainSigning } as WalletDetails)
  mockUseIsEoaEthFlow.mockReturnValue(isEoaEthFlow)
  mockUseIsSwapEth.mockReturnValue(isSwapEth)

  return renderHook(() => ({ reason: useGasPaymentReason(), shouldPayGas: useShouldPayGas() })).result.current
}

describe('useGasPaymentReason', () => {
  it('returns null when no wallet is connected and the sell token is not native', () => {
    expect(renderScenario({ account: undefined, allowsOffchainSigning: false })).toEqual({
      reason: null,
      shouldPayGas: false,
    })
  })

  it('returns eth-flow when no wallet is connected and the native token is sold', () => {
    expect(renderScenario({ account: undefined, allowsOffchainSigning: false, isSwapEth: true })).toEqual({
      reason: GasPaymentReason.EthFlow,
      shouldPayGas: true,
    })
  })

  it('returns null on Solana', () => {
    expect(
      renderScenario({ chainId: SupportedChainId.SOLANA, account: ACCOUNT, allowsOffchainSigning: false }),
    ).toEqual({ reason: null, shouldPayGas: false })
  })

  it('returns null for an EOA', () => {
    expect(renderScenario({ account: ACCOUNT, allowsOffchainSigning: true })).toEqual({
      reason: null,
      shouldPayGas: false,
    })
  })

  it('returns eth-flow for an EOA ETH-flow order', () => {
    expect(renderScenario({ account: ACCOUNT, allowsOffchainSigning: true, isEoaEthFlow: true })).toEqual({
      reason: GasPaymentReason.EthFlow,
      shouldPayGas: true,
    })
  })

  it('returns smart-contract-wallet for a wallet without off-chain signing', () => {
    expect(renderScenario({ account: ACCOUNT, allowsOffchainSigning: false })).toEqual({
      reason: GasPaymentReason.SmartContractWallet,
      shouldPayGas: true,
    })
  })
})
