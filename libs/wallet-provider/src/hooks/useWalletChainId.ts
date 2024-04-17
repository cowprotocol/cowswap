import { useWeb3ModalAccount } from '@web3modal/ethers5/react'

export function useWalletChainId(): number | undefined {
  const { chainId } = useWeb3ModalAccount()

  return chainId
}
