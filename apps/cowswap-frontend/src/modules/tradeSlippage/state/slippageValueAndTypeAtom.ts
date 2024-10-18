import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { DEFAULT_SLIPPAGE_BPS, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { bpsToPercent } from '@cowprotocol/common-utils'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { isEoaEthFlowAtom } from 'modules/trade'

type SlippageBpsPerNetwork = Record<SupportedChainId, number | null>

type SlippageType = 'smart' | 'default' | 'user'

const normalTradeSlippageAtom = atomWithStorage<SlippageBpsPerNetwork>(
  'swapSlippageAtom:v0',
  mapSupportedNetworks(null),
)

const ethFlowSlippageAtom = atomWithStorage<SlippageBpsPerNetwork>('ethFlowSlippageAtom:v0', mapSupportedNetworks(null))

export const smartTradeSlippageAtom = atom<number | null>(null)

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

export const tradeSlippagePercentAtom = atom((get) => {
  return bpsToPercent(get(slippageValueAndTypeAtom).value)
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
