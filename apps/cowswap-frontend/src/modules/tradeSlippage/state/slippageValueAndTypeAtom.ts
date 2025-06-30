import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { clampValue } from '@cowprotocol/common-utils'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { injectedWidgetParamsAtom } from 'modules/injectedWidget/state/injectedWidgetParamsAtom'
import { isEoaEthFlowAtom, tradeTypeAtom, TradeTypeMap } from 'modules/trade'

import { getDefaultSlippage, getIsAutoSlippageDisabled, getMaxSlippage, getMinSlippage } from '../utils/slippage'

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
  const injectedParams = get(injectedWidgetParamsAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)
  const { chainId } = get(walletInfoAtom)
  const trade = get(tradeTypeAtom)?.tradeType
  const tradeType = trade ? TradeTypeMap[trade] : undefined

  const { ethFlowSlippage, erc20Slippage } = injectedParams.params
  const currentFlowSlippage = isEoaEthFlow ? ethFlowSlippage : erc20Slippage

  const minSlippage = getMinSlippage(currentFlowSlippage, chainId, isEoaEthFlow, tradeType)
  const maxSlippage = getMaxSlippage(currentFlowSlippage, chainId, tradeType)
  const defaultSlippage = getDefaultSlippage(currentFlowSlippage, chainId, tradeType, isEoaEthFlow)
  const isSmartSlippageDisabled = getIsAutoSlippageDisabled(currentFlowSlippage, chainId, tradeType)

  return {
    min: minSlippage,
    max: maxSlippage,
    isSmartSlippageDisabled,
    defaultValue: clampValue(defaultSlippage, minSlippage, maxSlippage),
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
