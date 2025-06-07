import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { useWalletDetails } from '@cowprotocol/wallet'

import { useIsCurrentTradeBridging, useIsHooksTradeType } from 'modules/trade'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useShouldDisplayBridgeDetails() {
  const isHooksTabEnabled = useIsHooksTradeType()
  const { isSmartContractWallet } = useWalletDetails()
  const isBridgingEnabled = useIsBridgingEnabled(isSmartContractWallet)
  const isCurrentTradeBridging = useIsCurrentTradeBridging()

  return isBridgingEnabled && isCurrentTradeBridging && !isHooksTabEnabled
}
