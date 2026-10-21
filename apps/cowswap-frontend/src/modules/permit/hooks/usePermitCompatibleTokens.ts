import { useMemo } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'

import { usePreGeneratedPermitInfo } from './usePreGeneratedPermitInfo'

import { PermitCompatibleTokens } from '../types'

export function usePermitCompatibleTokens(): PermitCompatibleTokens {
  const { allPermitInfo } = usePreGeneratedPermitInfo()
  const isPermitEnabled = useIsPermitEnabled()

  return useMemo(() => {
    if (!isPermitEnabled) {
      return {}
    }

    const permitCompatibleTokens: PermitCompatibleTokens = {}

    for (const [address, permitInfo] of Object.entries(allPermitInfo)) {
      permitCompatibleTokens[getAddressKey(address)] = isSupportedPermitInfo(permitInfo)
    }

    return permitCompatibleTokens
  }, [allPermitInfo, isPermitEnabled])
}
