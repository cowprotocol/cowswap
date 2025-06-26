import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import {
  DEFAULT_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  MIN_SLIPPAGE_BPS,
  MINIMUM_ETH_FLOW_SLIPPAGE_BPS
} from '@cowprotocol/common-const'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { injectedWidgetParamsAtom } from 'modules/injectedWidget/state/injectedWidgetParamsAtom'
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

export const shouldUseAutoSlippageAtom = atom<boolean>(false)

export const setShouldUseAutoSlippageAtom = atom(null, (_, set, isEnabled: boolean) => {
  set(shouldUseAutoSlippageAtom, isEnabled)
})

export const slippageConfigAtom = atom((get) => {
  const { ethFlowSlippage, erc20Slippage } = get(injectedWidgetParamsAtom).params

  const isEoaEthFlow = get(isEoaEthFlowAtom)
  const { chainId } = get(walletInfoAtom)

  const currentFlowSlippage = isEoaEthFlow ? ethFlowSlippage : erc20Slippage;

  const minSlippage = currentFlowSlippage?.min
    ? currentFlowSlippage.min
    : isEoaEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId] : MIN_SLIPPAGE_BPS

  const maxSlippage = currentFlowSlippage?.max
    ? currentFlowSlippage.max
    : MAX_SLIPPAGE_BPS

  const defaultSlippage = currentFlowSlippage?.default
    ? currentFlowSlippage.default
    : isEoaEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId] : DEFAULT_SLIPPAGE_BPS

  // todo need to validate default slippage here
  // need to handle autoSlippage settings also here

  return {
    min: minSlippage,
    max: maxSlippage,
    default: defaultSlippage,
  }
})

// todo - think how to protect slippage if the settings were changed (f.e. user slippage is higher than max slippage)
export const currentUserSlippageAtom = atom<number | null>((get) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)
  const normalSlippage = get(normalTradeSlippageAtom)
  const ethFlowSlippage = get(ethFlowSlippageAtom)

  return (isEoaEthFlow ? ethFlowSlippage : normalSlippage)?.[chainId] ?? null
})

export const setUserSlippageAtom = atom(null, (get, set, slippageBps: number | null) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)

  const currentStateAtom = isEoaEthFlow ? ethFlowSlippageAtom : normalTradeSlippageAtom
  const currentState = get(currentStateAtom)

  set(currentStateAtom, {
    ...currentState,
    [chainId]: slippageBps,
  })
})
