import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { DEFAULT_SLIPPAGE_BPS, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { bpsToPercent } from '@cowprotocol/common-utils'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { isEoaEthFlowAtom, tradeTypeAtom } from 'modules/trade'
import { TradeType } from 'modules/trade/types/TradeType'

type SlippageBpsPerNetwork = Record<SupportedChainId, number | null>

type SlippagePerTradeType = Record<TradeType, SlippageBpsPerNetwork>

type SlippageType = 'smart' | 'default' | 'user'

const getDefaultSlippageState = () =>
  Object.keys(TradeType).reduce((acc, tradeType) => {
    acc[tradeType as TradeType] = mapSupportedNetworks(null)
    return acc
  }, {} as SlippagePerTradeType)

const normalTradeSlippageAtom = atomWithStorage<SlippagePerTradeType>('tradeSlippageAtom:v1', getDefaultSlippageState())

const ethFlowSlippageAtom = atomWithStorage<SlippagePerTradeType>('ethFlowSlippageAtom:v1', getDefaultSlippageState())

export const smartTradeSlippageAtom = atom<number | null>(null)

export const defaultSlippageAtom = atom((get) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)

  return isEoaEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId] : DEFAULT_SLIPPAGE_BPS
})

const currentSlippageAtom = atom<number | null>((get) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)
  const tradeTypeState = get(tradeTypeAtom)
  const normalSlippage = get(normalTradeSlippageAtom)
  const ethFlowSlippage = get(ethFlowSlippageAtom)

  if (!tradeTypeState) return null

  return (isEoaEthFlow ? ethFlowSlippage : normalSlippage)[tradeTypeState.tradeType]?.[chainId] ?? null
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

export const tradeSlippagePercentAtom = atom((get) => {
  return bpsToPercent(get(slippageValueAndTypeAtom).value)
})

export const setTradeSlippageAtom = atom(null, (get, set, slippageBps: number | null) => {
  const { chainId } = get(walletInfoAtom)
  const isEoaEthFlow = get(isEoaEthFlowAtom)
  const tradeTypeState = get(tradeTypeAtom)

  if (tradeTypeState) {
    const currentStateAtom = isEoaEthFlow ? ethFlowSlippageAtom : normalTradeSlippageAtom
    const currentState = get(currentStateAtom)

    set(currentStateAtom, {
      ...currentState,
      [tradeTypeState.tradeType]: {
        ...currentState[tradeTypeState.tradeType],
        [chainId]: slippageBps,
      },
    })
  } else {
    // It should not happen in the normal flow
    console.error('Trade type is not set, cannot set slippage!')
  }
})
