import { updateSelectedWallet } from 'state/user/reducer'
import { useAppDispatch } from 'state/hooks'
import { useWeb3React } from '@web3-react/core'

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
