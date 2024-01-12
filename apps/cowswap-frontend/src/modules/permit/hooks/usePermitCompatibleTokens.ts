import { useAtomValue } from 'jotai'
import { useMemo, useRef } from 'react'

import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'

import { usePreGeneratedPermitInfo } from './usePreGeneratedPermitInfo'

import { permittableTokensAtom } from '../state/permittableTokensAtom'
import { PermitCompatibleTokens } from '../types'

export function usePermitCompatibleTokens(): PermitCompatibleTokens {
  const { chainId } = useWalletInfo()
  const permitInfoAllChains = useAtomValue(permittableTokensAtom)
  const localPermitInfo = permitInfoAllChains[chainId] || {}
  const { allPermitInfo } = usePreGeneratedPermitInfo()

  const isPermitEnabled = useIsPermitEnabled()

  const stableRef = JSON.stringify(Object.keys(localPermitInfo).concat(Object.keys(allPermitInfo)))

  const localPermitInfoRef = useRef(localPermitInfo)
  localPermitInfoRef.current = localPermitInfo
  const preGeneratedPermitInfoRef = useRef(allPermitInfo)
  preGeneratedPermitInfoRef.current = allPermitInfo

  return useMemo(() => {
    // Don't deal with permit when it's not enabled
    if (!isPermitEnabled) {
      return {}
    }

    const permitCompatibleTokens: PermitCompatibleTokens = {}

    for (const address of Object.keys(preGeneratedPermitInfoRef.current)) {
      const addressLowerCased = address.toLowerCase()

      permitCompatibleTokens[addressLowerCased] = isSupportedPermitInfo(
        preGeneratedPermitInfoRef.current[addressLowerCased]
      )
    }

    for (const address of Object.keys(localPermitInfoRef.current)) {
      const addressLowerCased = address.toLowerCase()

      permitCompatibleTokens[addressLowerCased] = isSupportedPermitInfo(localPermitInfoRef.current[addressLowerCased])
    }

    return permitCompatibleTokens
    // Reducing unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableRef, isPermitEnabled])
}
