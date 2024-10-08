import { useWalletDetails } from '@cowprotocol/wallet'

import { useIsEoaEthFlow } from 'modules/trade'

export function useShouldPayGas() {
  const { allowsOffchainSigning } = useWalletDetails()
  const isEoaEthFlow = useIsEoaEthFlow()

  return isEoaEthFlow || !allowsOffchainSigning
}
