import { usePrevious } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

export function useOnAccountOrChainChanged(): boolean {
  const { chainId, account } = useWalletInfo()
  const prevChainId = usePrevious(chainId)
  const prevAccount = usePrevious(account)

  return Boolean(
    (prevChainId !== undefined && prevChainId !== chainId) || (prevAccount !== undefined && prevAccount !== account),
  )
}
