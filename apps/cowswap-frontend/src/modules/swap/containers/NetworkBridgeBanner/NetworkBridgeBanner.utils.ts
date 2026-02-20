import { SupportedChainId } from '@cowprotocol/cow-sdk'

// TODO: remove once network is supported for cross-chain swaps:

const SHOULD_SHOW_ALERT_CHAIN_IDS = [
  SupportedChainId.LENS,
  SupportedChainId.LINEA,
  SupportedChainId.PLASMA,
  SupportedChainId.INK,
] as const satisfies SupportedChainId[]

const SHOULD_SHOW_ALERT = new Set<SupportedChainId | undefined>(SHOULD_SHOW_ALERT_CHAIN_IDS)

export type NetworkAlertChains = (typeof SHOULD_SHOW_ALERT_CHAIN_IDS)[number]

export function shouldShowAlert(chainId: SupportedChainId | undefined): chainId is NetworkAlertChains {
  return SHOULD_SHOW_ALERT.has(chainId)
}
