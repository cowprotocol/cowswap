import { useCallback, useEffect } from 'react'

import { UNSUPPORTED_LIST_URLS } from '@cowprotocol/common-const'
import { useInterval, useIsWindowVisible } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'
import { getVersionUpgrade, minVersionBump, VersionUpgrade } from '@uniswap/token-lists'
import { useWeb3React } from '@web3-react/core'

import { useFetchListCallback } from 'legacy/hooks/useFetchListCallback'
import { updateVersion } from 'legacy/state/global/actions'
import { useAppDispatch } from 'legacy/state/hooks'
import { acceptListUpdate } from 'legacy/state/lists/actions'
import { useAllLists } from 'legacy/state/lists/hooks'
import { useActiveListUrls } from 'legacy/state/lists/hooks'

export function ListsUpdater(): null {
  const { provider } = useWeb3React()
  const { chainId } = useWalletInfo()
  const dispatch = useAppDispatch()
  const isWindowVisible = useIsWindowVisible()

  // get all loaded lists, and the active urls
  const lists = useAllLists()
  const activeListUrls = useActiveListUrls()

  const fetchList = useFetchListCallback()
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return
    Object.keys(lists).forEach((url) =>
      fetchList(url).catch((error) => console.debug('interval list fetching error', error))
    )
  }, [fetchList, isWindowVisible, lists])

  // fetch all lists every 10 minutes, but only after we initialize provider
  useInterval(fetchAllListsCallback, provider ? 1000 * 60 * 10 : null)

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl]
      if (!list.current && !list.loadingRequestId && !list.error) {
        fetchList(listUrl).catch((error) => console.debug('list added fetching error', error))
      }
    })
  }, [dispatch, fetchList, lists])

  // if any lists from unsupported lists are loaded, check them too (in case new updates since last visit)
  useEffect(() => {
    Object.keys(UNSUPPORTED_LIST_URLS[chainId]).forEach((listUrl) => {
      const list = lists[listUrl]
      if (!list || (!list.current && !list.loadingRequestId && !list.error)) {
        fetchList(listUrl).catch((error) => console.debug('list added fetching error', error))
      }
    })
  }, [chainId, dispatch, fetchList, lists])

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
            // automatically update minor/patch as long as bump matches the min update
            if (bump >= minVersionBump(list.current.tokens, list.pendingUpdate.tokens)) {
              dispatch(acceptListUpdate({ chainId, url: listUrl }))
            } else {
              console.error(
                `List at url ${listUrl} could not automatically update because the version bump was only PATCH/MINOR while the update had breaking changes and should have been MAJOR`
              )
            }
            break

          // update any active or inactive lists
          case VersionUpgrade.MAJOR:
            dispatch(acceptListUpdate({ chainId, url: listUrl }))
        }
      }
    })
  }, [dispatch, lists, activeListUrls, chainId])

  // automatically initialise lists if chainId changes
  useEffect(() => {
    if (chainId) {
      dispatch(updateVersion({ chainId }))
    }
  }, [chainId, dispatch])

  return null
}
