import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { IsTokenPermittableResult } from '@cowprotocol/permit-utils'

import { permittableTokensAtom } from '../state/permittableTokensAtom'

/**
 * Returns a callback for getting PermitInfo for a given token
 *
 * Assumes permit info was already checked and cached.
 */
export function useGetPermitInfo(chainId: SupportedChainId): (tokenAddress: string) => IsTokenPermittableResult {
  const permittableTokens = useAtomValue(permittableTokensAtom)

  return useCallback(
    (tokenAddress: string) => permittableTokens[chainId][tokenAddress.toLowerCase()],
    [chainId, permittableTokens]
  )
}
