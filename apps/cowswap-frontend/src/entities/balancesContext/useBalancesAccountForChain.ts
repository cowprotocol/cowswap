import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useSolanaAccount, useWalletInfo } from '@cowprotocol/wallet'

import { useBalancesContext } from './useBalancesContext'

/**
 * Resolves the account to use for balance fetching/display on `chainId`.
 *
 * A Solana account can't be derived from the connected EVM wallet, so browsing/fetching Solana
 * (e.g. as a bridge destination) must use the Solana-namespaced account instead of the EVM wallet
 * (or proxy) account — otherwise Solana balance fetching gets an invalid (EVM-shaped) public key.
 */
export function useBalancesAccountForChain(chainId: number): string | undefined {
  const { account } = useWalletInfo()
  const solanaAccount = useSolanaAccount()
  const balancesContext = useBalancesContext()

  const evmAccount = balancesContext.account || account

  return isSolanaChain(chainId) ? solanaAccount : evmAccount
}
