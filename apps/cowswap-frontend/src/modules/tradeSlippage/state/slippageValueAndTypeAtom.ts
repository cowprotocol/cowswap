import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { isValidIntegerFactory } from '@cowprotocol/common-utils'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { injectedWidgetParamsAtom } from 'modules/injectedWidget/state/injectedWidgetParamsAtom'
import { isEoaEthFlowAtom, tradeTypeAtom, TradeTypeMap } from 'modules/trade'

import {
  resolveSlippageConfig
} from '../utils/slippage'

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

  return resolveSlippageConfig(currentFlowSlippage, chainId, tradeType, isEoaEthFlow)
})

export const currentUserSlippageAtom = atom<number | null>((get) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)
  const normalSlippage = get(normalTradeSlippageAtom)
  const ethFlowSlippage = get(ethFlowSlippageAtom)

  const { min, max } = get(slippageConfigAtom)
  const isValidSlippage = isValidIntegerFactory(min, max)
  const userSlippage = (isEoaEthFlow ? ethFlowSlippage : normalSlippage)?.[chainId] ?? null

  return userSlippage
    // if slippage settings were changed via config and userSlippage is out of bounds -> ignore it
    ? isValidSlippage(userSlippage) ? userSlippage : null
    : null
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
