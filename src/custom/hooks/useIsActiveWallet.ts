import { Connection } from 'connection'
import { useSelectedWallet } from 'state/user/hooks'
import { useWeb3React } from '@web3-react/core'

export const useIsActiveWallet = (connection: Connection) => {
  const selectedWallet = useSelectedWallet()
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
