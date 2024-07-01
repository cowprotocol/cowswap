import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { DEFAULT_SLIPPAGE_BPS, DEFAULT_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { bpsToPercent } from '@cowprotocol/common-utils'
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
  DEFAULT_ETH_FLOW_SLIPPAGE_BPS
)

export const swapSlippageAtom = atom<number>((get) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)
  const normalSwapSlippage = get(normalSwapSlippageAtom)
  const ethFlowSlippage = get(ethFlowSlippageAtom)

  return (isEoaEthFlow ? ethFlowSlippage : normalSwapSlippage)[chainId]
})

export const swapSlippagePercentAtom = atom((get) => {
  return bpsToPercent(get(swapSlippageAtom))
})

const defaultSlippageAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)

  return isEoaEthFlow ? DEFAULT_ETH_FLOW_SLIPPAGE_BPS[chainId] : DEFAULT_SLIPPAGE_BPS
})

export const isCurrentSlippageDefault = atom((get) => {
  const slippageBps = get(swapSlippageAtom)
  const defaultSlippage = get(defaultSlippageAtom)

  return defaultSlippage === slippageBps
})

export const setSwapSlippageAtom = atom(null, (get, set, _slippageBps: number | null) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)
  const defaultSlippage = get(defaultSlippageAtom)

  const slippageBps = _slippageBps === null ? defaultSlippage : _slippageBps

  if (isEoaEthFlow) {
    const currentState = get(ethFlowSlippageAtom)
    set(ethFlowSlippageAtom, { ...currentState, [chainId]: slippageBps })
  } else {
    const currentState = get(normalSwapSlippageAtom)

    set(normalSwapSlippageAtom, { ...currentState, [chainId]: slippageBps })
  }
})
