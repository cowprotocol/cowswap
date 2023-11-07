import { useAtomValue } from 'jotai'
import { useMemo, useRef } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'

import { usePreGeneratedPermitInfo } from './usePreGeneratedPermitInfo'

import { permittableTokensAtom } from '../state/permittableTokensAtom'
import { PermitCompatibleTokens } from '../types'

export function usePermitCompatibleTokens(): PermitCompatibleTokens {
  const { chainId } = useWalletInfo()
  const localPermitInfo = useAtomValue(permittableTokensAtom)[chainId]
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
      permitCompatibleTokens[address.toLowerCase()] = !!preGeneratedPermitInfoRef.current[address]
    }

    for (const address of Object.keys(localPermitInfoRef.current)) {
      permitCompatibleTokens[address.toLowerCase()] = !!localPermitInfoRef.current[address]
    }

    return permitCompatibleTokens
    // Reducing unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableRef, isPermitEnabled])
}
