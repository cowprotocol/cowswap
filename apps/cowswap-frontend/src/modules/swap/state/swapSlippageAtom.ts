import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { DEFAULT_SLIPPAGE_BPS, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { isEoaEthFlowAtom } from './isEoaEthFlowAtom'

type SlippageBpsPerNetwork = Record<SupportedChainId, number>

const normalSwapSlippageAtom = atomWithStorage<SlippageBpsPerNetwork>(
  'swap-slippage-atom:v1',
  mapSupportedNetworks(DEFAULT_SLIPPAGE_BPS)
)

export const ethFlowSlippageAtom = atomWithStorage<SlippageBpsPerNetwork>(
  'eth-flow-slippage-atom:v1',
  MINIMUM_ETH_FLOW_SLIPPAGE_BPS
)

export const swapSlippageAtom = atom<number>((get) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)
  const normalSwapSlippage = get(normalSwapSlippageAtom)
  const ethFlowSlippage = get(ethFlowSlippageAtom)

  return (isEoaEthFlow ? ethFlowSlippage : normalSwapSlippage)[chainId]
})
