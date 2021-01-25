import { Contract } from '@ethersproject/contracts'
import { useActiveWeb3React } from 'hooks'

import { useContract } from '@src/hooks/useContract'

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from 'constants/index'
import { GP_V2_SETTLEMENT_INTERFACE } from 'constants/GPv2Settlement'
import { ChainId } from '@uniswap/sdk'
import ENS_ABI from 'constants/abis/ens-registrar.json'

export * from '@src/hooks/useContract'

export function useGP2SettlementContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && GP_SETTLEMENT_CONTRACT_ADDRESS[chainId], GP_V2_SETTLEMENT_INTERFACE, false)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GÖRLI:
      case ChainId.ROPSTEN:
      case ChainId.RINKEBY:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
      case ChainId.XDAI:
        address = '0x25D2252Ec30de7830b6825D6b4A08E70a581cD6a'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}
