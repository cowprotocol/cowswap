import { useWeb3React } from '@web3-react/core'

import { useAppDispatch } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'

export function useDisconnectWallet() {
  const { connector } = useWeb3React()
  const dispatch = useAppDispatch()

  return () => {
    if (connector.deactivate) {
      connector.deactivate()
    } else {
      connector.resetState()
    }
    dispatch(updateSelectedWallet({ wallet: undefined }))
  }
}
