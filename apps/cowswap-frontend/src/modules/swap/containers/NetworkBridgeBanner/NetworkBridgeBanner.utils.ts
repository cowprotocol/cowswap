import { SupportedChainId } from '@cowprotocol/cow-sdk'

// TODO: remove once network is supported for cross-chain swaps
const SHOULD_SHOW_ALERT = {
  [SupportedChainId.LENS]: true,
  [SupportedChainId.LINEA]: true,
  [SupportedChainId.PLASMA]: true,
  [SupportedChainId.INK]: true,
}

export type NetworkAlertChains = keyof typeof SHOULD_SHOW_ALERT

export function shouldShowAlert(chainId: number | undefined): chainId is NetworkAlertChains {
  return Boolean(chainId && SHOULD_SHOW_ALERT[chainId as unknown as NetworkAlertChains])
}
