import { useIsTxBundlingSupported } from '@cowprotocol/wallet'

import { useIsSwapEth } from './useIsSwapEth'

export function useIsSafeEthFlow(): boolean {
  const isSwapEth = useIsSwapEth()
  const isBundlingSupported = useIsTxBundlingSupported()

  return Boolean(isBundlingSupported && isSwapEth)
}
