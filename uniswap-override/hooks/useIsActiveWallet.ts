import { Connection } from 'connection'
import { useSelectedWallet } from 'state/user/hooks'

export const useIsActiveWallet = (connection: Connection) => {
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
