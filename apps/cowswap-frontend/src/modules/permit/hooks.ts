import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { Nullish } from 'types'

import { useWalletInfo } from 'modules/wallet'

import { estimatePermit } from 'utils/permitTokenChecker'

import { addPermitInfoForTokenAtom, permittableTokensAtom } from './state/atoms'
import { IsTokenPermittableResult, PermitInfo } from './types'

/**
 * Returns a callback for adding PermitInfo for a given token
 */
function useAddPermitInfo() {
  const addPermitInfoForToken = useSetAtom(addPermitInfoForTokenAtom)

  return useCallback(
    (chainId: SupportedChainId, tokenAddress: string, permitInfo: PermitInfo) => {
      addPermitInfoForToken({ chainId, tokenAddress, permitInfo })
    },
    [addPermitInfoForToken]
  )
}

/**
 * Returns whether a token is permittable.
 *
 * When it is, returned type is `{type: 'dai'|'permit', gasLimit: number}`
 * When it is not, returned type is `false`
 * When it is unknown, returned type is `undefined`
 *
 * @param tokenAddress
 */
function usePermitInfo(chainId: SupportedChainId, tokenAddress: string | undefined): IsTokenPermittableResult {
  const permittableTokens = useAtomValue(permittableTokensAtom)

  return useMemo(() => {
    if (!chainId || !tokenAddress) return undefined

    return permittableTokens[chainId][tokenAddress.toLowerCase()]
  }, [chainId, permittableTokens, tokenAddress])
}

/**
 * Checks whether the token is permittable, and caches the result on localStorage
 *
 * When it is, returned type is `{type: 'dai'|'permit', gasLimit: number}
 * When it is not, returned type is `false`
 * When it is unknown, returned type is `undefined`
 *
 * @param token
 */
export function useIsTokenPermittable(token: Nullish<Currency>): IsTokenPermittableResult {
  const { chainId } = useWalletInfo()
  const { provider } = useWeb3React()

  const lowerCaseAddress = token?.wrapped?.address?.toLowerCase()
  const isNative = token?.isNative
  const tokenName = token?.name || lowerCaseAddress || ''

  const addPermitInfo = useAddPermitInfo()
  const permitInfo = usePermitInfo(chainId, lowerCaseAddress)

  useEffect(() => {
    console.debug(`bug--useIsTokenPermittable--useEffect`, chainId, lowerCaseAddress, tokenName, permitInfo)
    if (!chainId || !lowerCaseAddress || !provider || permitInfo !== undefined || isNative) {
      return
    }

    estimatePermit(lowerCaseAddress, tokenName, chainId, provider).then((result) => {
      if (!result) {
        // When falsy, we know it doesn't support permit. Cache it.
        addPermitInfo(chainId, lowerCaseAddress, false)
      } else if ('error' in result) {
        // When error, we don't know. Log and don't cache.
        console.debug(
          `useIsTokenPermittable: failed to check whether token ${lowerCaseAddress} is permittable: ${result.error}`
        )
      } else {
        // Otherwise, we know it is permittable. Cache it.
        addPermitInfo(chainId, lowerCaseAddress, result)
      }
    })
  }, [addPermitInfo, chainId, isNative, lowerCaseAddress, permitInfo, provider, tokenName])

  if (isNative) {
    return false
  }

  return permitInfo
}
