import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { useWalletDetails } from '@cowprotocol/wallet'

import { useIsCurrentTradeBridging, useIsHooksTradeType } from 'modules/trade'

export function useShouldDisplayBridgeDetails(): boolean {
  const isHooksTabEnabled = useIsHooksTradeType()
  const { isSmartContractWallet } = useWalletDetails()
  const isBridgingEnabled = useIsBridgingEnabled(isSmartContractWallet)
  const isCurrentTradeBridging = useIsCurrentTradeBridging()

  return isBridgingEnabled && isCurrentTradeBridging && !isHooksTabEnabled
}
