import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { Nullish } from 'types'

import { TradeType } from 'modules/trade'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'

import { ORDER_TYPE_SUPPORTS_PERMIT } from '../const'
import { addPermitInfoForTokenAtom, permittableTokensAtom } from '../state/permittableTokensAtom'
import { IsTokenPermittableResult } from '../types'
import { checkIsTokenPermittable } from '../utils/checkIsTokenPermittable'

/**
 * Checks whether the token is permittable, and caches the result on localStorage
 *
 * When it is, returned type is `{type: 'dai'|'permit', gasLimit: number}
 * When it is not, returned type is `false`
 * When it is unknown, returned type is `undefined`
 *
 */
export function useIsTokenPermittable(
  token: Nullish<Currency>,
  tradeType: Nullish<TradeType>
): IsTokenPermittableResult {
  const { chainId } = useWalletInfo()
  const { provider } = useWeb3React()

  const lowerCaseAddress = token?.wrapped?.address?.toLowerCase()
  const isNative = token?.isNative
  const tokenName = token?.name || lowerCaseAddress || ''

  // Avoid building permit info in the first place if order type is not supported
  const isPermitSupported = !!tradeType && ORDER_TYPE_SUPPORTS_PERMIT[tradeType]

  const isPermitEnabled = useIsPermitEnabled(chainId) && isPermitSupported

  const addPermitInfo = useAddPermitInfo()
  const permitInfo = usePermitInfo(chainId, isPermitEnabled ? lowerCaseAddress : undefined)

  useEffect(() => {
    if (!chainId || !isPermitEnabled || !lowerCaseAddress || !provider || permitInfo !== undefined || isNative) {
      return
    }

    checkIsTokenPermittable({ tokenAddress: lowerCaseAddress, tokenName, chainId, provider }).then((result) => {
      if (!result) {
        // When falsy, we know it doesn't support permit. Cache it.
        addPermitInfo({ chainId, tokenAddress: lowerCaseAddress, permitInfo: false })
      } else if ('error' in result) {
        // When error, we don't know. Log and don't cache.
        console.debug(
          `useIsTokenPermittable: failed to check whether token ${lowerCaseAddress} is permittable: ${result.error}`
        )
      } else {
        // Otherwise, we know it is permittable. Cache it.
        addPermitInfo({ chainId, tokenAddress: lowerCaseAddress, permitInfo: result })
      }
    })
  }, [addPermitInfo, chainId, isNative, isPermitEnabled, lowerCaseAddress, permitInfo, provider, tokenName])

  if (isNative) {
    return false
  }
  // TODO: add an updater for this
  return permitInfo
}

/**
 * Returns a callback for adding PermitInfo for a given token
 */
function useAddPermitInfo() {
  return useSetAtom(addPermitInfoForTokenAtom)
}

/**
 * Returns whether a token is permittable.
 *
 * When it is, returned type is `{type: 'dai'|'permit', gasLimit: number}`
 * When it is not, returned type is `false`
 * When it is unknown, returned type is `undefined`
 */
function usePermitInfo(chainId: SupportedChainId, tokenAddress: string | undefined): IsTokenPermittableResult {
  const permittableTokens = useAtomValue(permittableTokensAtom)

  return useMemo(() => {
    if (!tokenAddress) return undefined

    return permittableTokens[chainId][tokenAddress.toLowerCase()]
  }, [chainId, permittableTokens, tokenAddress])
}
