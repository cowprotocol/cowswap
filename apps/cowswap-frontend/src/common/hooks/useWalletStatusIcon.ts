import { useWalletDetails } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { StatusIcon } from 'modules/account/containers/AccountDetails/StatusIcon'

export function useWalletStatusIcon(): JSX.Element | null {
  const walletDetails = useWalletDetails()
  const { connector } = useWeb3React()

  return <StatusIcon connector={connector} walletDetails={walletDetails} size={56} />
}
