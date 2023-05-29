import { useWeb3React } from '@web3-react/core'

import { getStatusIcon } from 'modules/account/containers/AccountDetails'
import { useWalletDetails } from 'modules/wallet'

export function useWalletStatusIcon(): JSX.Element | null {
  const walletDetails = useWalletDetails()
  const { connector } = useWeb3React()

  return getStatusIcon(connector, walletDetails, 56)
}
