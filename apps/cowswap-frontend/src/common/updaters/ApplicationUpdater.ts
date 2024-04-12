import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { useWeb3React } from '@web3-react/core'

import { useAppDispatch } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'

export function ApplicationUpdater(): null {
  const { account } = useWeb3React()
  const dispatch = useAppDispatch()
  const prevAccount = usePrevious(account)

  // This will remove selected wallet on disconnect
  // Needed for some wallets so that on refresh there isn't popup to connect
  // TODO: add unit test for this
  useEffect(() => {
    if (prevAccount && !account) {
      dispatch(updateSelectedWallet({ wallet: undefined }))
    }
  }, [account, prevAccount, dispatch])

  return null
}
