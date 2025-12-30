import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { refetchGeoDataAtom } from '../state/geoDataAtom'

export function GeoDataUpdater(): null {
  const { account } = useWalletInfo()
  const refetchGeoData = useSetAtom(refetchGeoDataAtom)
  const prevAccount = usePrevious(account)

  useEffect(() => {
    // only refetch when wallet actually changes (not on initial render)
    if (prevAccount !== account) {
      refetchGeoData()
    }
  }, [account, prevAccount, refetchGeoData])

  return null
}
