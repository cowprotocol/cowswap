import { useWeb3React } from '@web3-react/core'

import { Web3ReactConnection } from '../types'

export const useIsActiveConnection = (selectedWallet: string | undefined, connection: Web3ReactConnection) => {
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
