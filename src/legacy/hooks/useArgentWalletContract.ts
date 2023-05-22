import { useWalletInfo } from 'modules/wallet'
import ArgentWalletContractABI from 'legacy/abis/argent-wallet-contract.json'
import { ArgentWalletContract } from 'legacy/abis/types'
import { useContract } from './useContract'
import useIsArgentWallet from './useIsArgentWallet'

export function useArgentWalletContract(): ArgentWalletContract | null {
  const { account } = useWalletInfo()
  const isArgentWallet = useIsArgentWallet()
  return useContract(
    isArgentWallet ? account ?? undefined : undefined,
    ArgentWalletContractABI,
    true
  ) as ArgentWalletContract
}
