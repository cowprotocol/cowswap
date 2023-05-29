import { useEffect, useState } from 'react'

import { useWeb3React } from '@web3-react/core'

import useDebounce from 'legacy/hooks/useDebounce'
import useIsWindowVisible from 'legacy/hooks/useIsWindowVisible'
import usePrevious from 'legacy/hooks/usePrevious'
import { useAppDispatch } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

import { updateChainId } from './reducer'

export default function Updater(): null {
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
    const chainId = debouncedChainId ? supportedChainId(debouncedChainId) ?? null : null
    dispatch(updateChainId({ chainId }))
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
