import { useWeb3React } from '@web3-react/core'

import { Web3ReactConnection } from '../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useIsActiveConnection = (selectedWallet: string | undefined, connection: Web3ReactConnection) => {
  // TODO M-2 COW-568
  // Wallet connection (and warnings) through wagmi will be handled in a future task
  const { account } = useWeb3React()

  const isActive = connection.hooks.useIsActive()

  if (!isActive) {
    return false
  } else if (isActive && !selectedWallet && account) {
    return true
  } else {
    return selectedWallet === connection.type
  }
}
