import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { GP_VAULT_RELAYER } from '@cowprotocol/common-const'
import { getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getTokenPermitInfo } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { Nullish } from 'types'

import { TradeType } from 'modules/trade'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'

import { usePreGeneratedPermitInfoForToken } from './usePreGeneratedPermitInfoForToken'

import { ORDER_TYPE_SUPPORTS_PERMIT } from '../const'
import { addPermitInfoForTokenAtom, permittableTokensAtom } from '../state/permittableTokensAtom'
import { IsTokenPermittableResult } from '../types'

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

  const lowerCaseAddress = token ? getWrappedToken(token).address?.toLowerCase() : undefined
  const isNative = !!token && getIsNativeToken(token)
  const tokenName = token?.name || lowerCaseAddress || ''

  // Avoid building permit info in the first place if order type is not supported
  const isPermitSupported = !!tradeType && ORDER_TYPE_SUPPORTS_PERMIT[tradeType]

  const isPermitEnabled = useIsPermitEnabled() && isPermitSupported

  const addPermitInfo = useAddPermitInfo()
  const permitInfo = usePermitInfo(chainId, isPermitEnabled ? lowerCaseAddress : undefined)
  const { permitInfo: preGeneratedInfo, isLoading: preGeneratedIsLoading } = usePreGeneratedPermitInfoForToken(
    isPermitEnabled ? token : undefined
  )

  const spender = GP_VAULT_RELAYER[chainId]

  useEffect(() => {
    if (
      !chainId ||
      !isPermitEnabled ||
      !lowerCaseAddress ||
      !provider ||
      permitInfo !== undefined ||
      isNative ||
      // Do not try to load when pre-generated info is loading
      preGeneratedIsLoading ||
      // Do not try to load when pre-generated exists
      preGeneratedInfo !== undefined
    ) {
      return
    }

    getTokenPermitInfo({ spender, tokenAddress: lowerCaseAddress, tokenName, chainId, provider }).then((result) => {
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
  }, [
    addPermitInfo,
    chainId,
    isNative,
    isPermitEnabled,
    lowerCaseAddress,
    permitInfo,
    preGeneratedInfo,
    preGeneratedIsLoading,
    provider,
    spender,
    tokenName,
  ])

  if (isNative) {
    return false
  }

  return preGeneratedInfo ?? permitInfo
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
