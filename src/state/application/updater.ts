import { useWalletInfo } from '@cow/modules/wallet'
import { useWeb3React } from '@web3-react/core'
import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useEffect, useState } from 'react'
// import { api, CHAIN_TAG } from 'state/data/enhanced'
import { useAppDispatch /*useAppSelector*/ } from 'state/hooks'
import { supportedChainId } from 'utils/supportedChainId'
import { updateSelectedWallet } from 'state/user/reducer'

import { updateChainId } from './reducer'
import usePrevious from '@src/hooks/usePrevious'

/* function useQueryCacheInvalidator() {
  const dispatch = useAppDispatch()

  // subscribe to `chainId` changes in the redux store rather than Web3
  // this will ensure that when `invalidateTags` is called, the latest
  // `chainId` is available in redux to build the subgraph url
  const chainId = useAppSelector((state) => state.application.chainId)

  useEffect(() => {
    dispatch(api.util.invalidateTags([CHAIN_TAG]))
  }, [chainId, dispatch])
} */

export default function Updater(): null {
  const { chainId } = useWalletInfo()
  const { provider, account } = useWeb3React()
  const dispatch = useAppDispatch()
  const windowVisible = useIsWindowVisible()
  const prevAccount = usePrevious(account)

  const [activeChainId, setActiveChainId] = useState(chainId)

  // useQueryCacheInvalidator()

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
  }, [account, prevAccount])

  return null
}
