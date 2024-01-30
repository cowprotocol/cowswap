import { useWalletDetails } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { AccountIcon } from 'modules/account/containers/AccountDetails/AccountIcon'

export function useWalletStatusIcon(): JSX.Element | null {
  const walletDetails = useWalletDetails()
  const { connector } = useWeb3React()

  return <AccountIcon connector={connector} walletDetails={walletDetails} size={56} />
}
