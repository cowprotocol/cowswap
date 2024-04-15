import { useWalletDetails } from '@cowprotocol/wallet'

import { AccountIcon } from 'modules/account/containers/AccountDetails/AccountIcon'

export function useWalletStatusIcon(): JSX.Element | null {
  const walletDetails = useWalletDetails()

  return <AccountIcon walletDetails={walletDetails} size={56} />
}
