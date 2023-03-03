import { Web3ReactConnection } from '@cow/modules/wallet/web3-react/types'
import { useSelectedWallet } from 'state/user/hooks'

export const useIsActiveWallet = (connection: Web3ReactConnection) => {
  const selectedWallet = useSelectedWallet()

  const isActive = connection.hooks.useIsActive()

  if (!isActive) {
    return false
  } else if (isActive && !selectedWallet) {
    return true
  } else {
    return selectedWallet === connection.type
  }
}
