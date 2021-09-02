import { Contract } from '@ethersproject/contracts'
import { useActiveWeb3React } from 'hooks/web3'

import { useContract } from '@src/hooks/useContract'

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from 'constants/index'
import { SupportedChainId as ChainId } from 'constants/chains'
import ENS_ABI from 'abis/ens-registrar.json'

import { GPv2Settlement } from 'abis/types'
import GPv2_SETTLEMENT_ABI from 'abis/GPv2Settlement.json'

export * from '@src/hooks/useContract'

export function useGP2SettlementContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract<GPv2Settlement>(
    chainId ? GP_SETTLEMENT_CONTRACT_ADDRESS[chainId] : undefined,
    GPv2_SETTLEMENT_ABI,
    false
  )
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GOERLI:
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
