import { useAllLists } from 'state/lists/hooks'
import { getVersionUpgrade, minVersionBump, VersionUpgrade } from '@uniswap/token-lists'
import { useCallback, useEffect } from 'react'

import { useActiveWeb3React } from 'hooks/web3'
import { useFetchListCallback } from 'hooks/useFetchListCallback'
import useInterval from 'hooks/useInterval'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { acceptListUpdate } from 'state/lists/actions'
import { useActiveListUrls } from 'state/lists/hooks'
import { DEFAULT_NETWORK_FOR_LISTS, UNSUPPORTED_LIST_URLS } from 'constants/lists'
import { useAppDispatch } from 'state/hooks'
// MOD: add updateVersion for chainId change init
import { updateVersion } from 'state/global/actions'
import { supportedChainId } from 'utils/supportedChainId'

export default function Updater(): null {
  // MOD: chainId
  // const { library } = useActiveWeb3React()
  const { chainId: connectedChainId, library } = useActiveWeb3React()
  // chainId returns number or undefined we need to map against supported chains
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS

  const dispatch = useAppDispatch()
  const isWindowVisible = useIsWindowVisible()

  // get all loaded lists, and the active urls
  const lists = useAllLists()
  const activeListUrls = useActiveListUrls()

  // TODO: removed in V3, review if this is ok
  // initiate loading
  // useAllInactiveTokens()

  const fetchList = useFetchListCallback()
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return
    Object.keys(lists).forEach((url) =>
      fetchList(url).catch((error) => console.debug('interval list fetching error', error))
    )
  }, [fetchList, isWindowVisible, lists])

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null)

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl]
      if (!list.current && !list.loadingRequestId && !list.error) {
        fetchList(listUrl).catch((error) => console.debug('list added fetching error', error))
      }
    })
  }, [dispatch, fetchList, library, lists])

  // if any lists from unsupported lists are loaded, check them too (in case new updates since last visit)
  useEffect(() => {
    Object.keys(UNSUPPORTED_LIST_URLS[chainId]).forEach((listUrl) => {
      const list = lists[listUrl]
      if (!list || (!list.current && !list.loadingRequestId && !list.error)) {
        fetchList(listUrl).catch((error) => console.debug('list added fetching error', error))
      }
    })
  }, [chainId, dispatch, fetchList, library, lists])

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl]
      if (list.current && list.pendingUpdate) {
        const bump = getVersionUpgrade(list.current.version, list.pendingUpdate.version)
        switch (bump) {
          case VersionUpgrade.NONE:
            throw new Error('unexpected no version bump')
          case VersionUpgrade.PATCH:
          case VersionUpgrade.MINOR:
            const min = minVersionBump(list.current.tokens, list.pendingUpdate.tokens)
            // automatically update minor/patch as long as bump matches the min update
            if (bump >= min) {
              // MOD: need to update the acceptListUpdate params
              // dispatch(acceptListUpdate(listUrl))
              dispatch(acceptListUpdate({ chainId, url: listUrl }))
            } else {
              console.error(
                `List at url ${listUrl} could not automatically update because the version bump was only PATCH/MINOR while the update had breaking changes and should have been MAJOR`
              )
            }
            break

          // update any active or inactive lists
          case VersionUpgrade.MAJOR:
            // MOD: need to update the acceptListUpdate params
            // dispatch(acceptListUpdate(listUrl))
            dispatch(acceptListUpdate({ chainId, url: listUrl }))
        }
      }
    })
    // MOD: deps
    // }, [dispatch, lists, activeListUrls])
  }, [dispatch, lists, activeListUrls, chainId])

  // automatically initialise lists if chainId changes
  useEffect(() => {
    if (chainId) {
      dispatch(updateVersion({ chainId }))
    }
  }, [chainId, dispatch])

  return null
}
