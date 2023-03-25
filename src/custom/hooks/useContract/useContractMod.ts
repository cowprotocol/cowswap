import ENS_ABI from 'abis/ens-registrar.json'

import { useContract } from '@src/hooks/useContract'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cow/modules/wallet'

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
  const { chainId } = useWalletInfo()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GOERLI:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
      case ChainId.GNOSIS_CHAIN:
        address = '0x25D2252Ec30de7830b6825D6b4A08E70a581cD6a'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}
