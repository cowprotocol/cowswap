import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { DEFAULT_SLIPPAGE_BPS, MAX_SLIPPAGE_BPS, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { isEoaEthFlowAtom } from 'modules/trade'

type SlippageBpsPerNetwork = PersistentStateByChain<number>

export type SlippageType = 'smart' | 'default' | 'user'

const normalTradeSlippageAtom = atomWithStorage<SlippageBpsPerNetwork>(
  'swapSlippageAtom:v0',
  mapSupportedNetworks(undefined),
)

const ethFlowSlippageAtom = atomWithStorage<SlippageBpsPerNetwork>(
  'ethFlowSlippageAtom:v0',
  mapSupportedNetworks(undefined),
)

const smartTradeSlippageInnerAtom = atom<number | null>(null)

export const setSmartTradeSlippageAtom = atom(null, (_, set, slippage: number | null) => {
  const cappedSlippage = typeof slippage === 'number' ? Math.min(slippage, MAX_SLIPPAGE_BPS) : slippage

  set(smartTradeSlippageInnerAtom, cappedSlippage)
})

export const smartTradeSlippageAtom = atom((get) => get(smartTradeSlippageInnerAtom))

export const defaultSlippageAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)

  return isEoaEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId] : DEFAULT_SLIPPAGE_BPS
})

const currentSlippageAtom = atom<number | null>((get) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)
  const normalSlippage = get(normalTradeSlippageAtom)
  const ethFlowSlippage = get(ethFlowSlippageAtom)

  return (isEoaEthFlow ? ethFlowSlippage : normalSlippage)?.[chainId] ?? null
})

export const slippageValueAndTypeAtom = atom<{ type: SlippageType; value: number }>((get) => {
  const currentSlippage = get(currentSlippageAtom)
  const defaultSlippage = get(defaultSlippageAtom)
  const smartSlippage = get(smartTradeSlippageAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)

  if (typeof currentSlippage === 'number') {
    return { type: 'user', value: currentSlippage }
  }

  if (!isEoaEthFlow && smartSlippage && smartSlippage !== defaultSlippage) {
    return { type: 'smart', value: smartSlippage }
  }

  return { type: 'default', value: defaultSlippage }
})

export const setTradeSlippageAtom = atom(null, (get, set, slippageBps: number | null) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)

  const currentStateAtom = isEoaEthFlow ? ethFlowSlippageAtom : normalTradeSlippageAtom
  const currentState = get(currentStateAtom)

  set(currentStateAtom, {
    ...currentState,
    [chainId]: slippageBps,
  })
})
