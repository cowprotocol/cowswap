import { useWalletDetails } from '@cowprotocol/wallet'

import { useIsEoaEthFlow } from 'modules/trade'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useShouldPayGas() {
  const { allowsOffchainSigning } = useWalletDetails()
  const isEoaEthFlow = useIsEoaEthFlow()

  return isEoaEthFlow || !allowsOffchainSigning
}
