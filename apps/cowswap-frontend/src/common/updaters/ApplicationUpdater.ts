import { useEffect, useState } from 'react'

import { usePrevious, useIsWindowVisible, useDebounce } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { updateChainId } from 'legacy/state/application/reducer'
import { useAppDispatch } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'

export function ApplicationUpdater(): null {
  const { chainId } = useWalletInfo()
  const { provider, account } = useWeb3React()
  const dispatch = useAppDispatch()
  const windowVisible = useIsWindowVisible()
  const prevAccount = usePrevious(account)

  const [activeChainId, setActiveChainId] = useState(chainId)

  useEffect(() => {
    if (provider && chainId && windowVisible) {
      setActiveChainId(chainId)
    }
  }, [dispatch, chainId, provider, windowVisible])

  const debouncedChainId = useDebounce(activeChainId, 100)

  useEffect(() => {
    dispatch(updateChainId({ chainId: debouncedChainId }))
  }, [dispatch, debouncedChainId])

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
