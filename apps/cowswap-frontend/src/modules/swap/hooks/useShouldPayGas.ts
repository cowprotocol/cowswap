import { useWalletDetails } from '@cowprotocol/wallet'

import { useIsEoaEthFlow } from './useIsEoaEthFlow'

export function useShouldPayGas() {
  const { allowsOffchainSigning } = useWalletDetails()
  const isEoaEthFlow = useIsEoaEthFlow()

  return isEoaEthFlow || !allowsOffchainSigning
}
