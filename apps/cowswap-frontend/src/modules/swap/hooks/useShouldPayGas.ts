import { useWalletDetails } from '@cowprotocol/wallet'

import { useIsEoaEthFlow } from './useIsEoaEthFlow'

export function useShouldPayGas() {
  const { allowsOffchainSigning } = useWalletDetails()
  const isEoaEthFlow = useIsEoaEthFlow()

  const isPresign = !isEoaEthFlow && !allowsOffchainSigning
  return isEoaEthFlow || isPresign
}
