import { ArgentWalletContract, ArgentWalletContractAbi } from '@cowprotocol/abis'

import { useWalletInfo } from 'modules/wallet'

import { useContract } from './useContract'
import useIsArgentWallet from './useIsArgentWallet'

export function useArgentWalletContract(): ArgentWalletContract | null {
  const { account } = useWalletInfo()
  const isArgentWallet = useIsArgentWallet()
  return useContract(
    isArgentWallet ? account ?? undefined : undefined,
    ArgentWalletContractAbi,
    true
  ) as ArgentWalletContract
}
