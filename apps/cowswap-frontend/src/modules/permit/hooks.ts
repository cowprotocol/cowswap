import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { Nullish } from 'types'

import { useDerivedTradeState } from 'modules/trade'
import { useWalletInfo } from 'modules/wallet'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { addPermitInfoForTokenAtom, permittableTokensAtom } from './state/atoms'
import { IsTokenPermittableResult, PermitHookData, PermitHookParams } from './types'
import { checkIsTokenPermittable } from './utils/checkIsTokenPermittable'
import { generatePermitHook } from './utils/generatePermitHook'

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
    if (!chainId || !lowerCaseAddress || !provider || permitInfo !== undefined || isNative) {
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
  }, [addPermitInfo, chainId, isNative, lowerCaseAddress, permitInfo, provider, tokenName])

  if (isNative) {
    return false
  }

  return permitInfo
}

/**
 * Returns PermitHookData using a fake signer if inputCurrency is permittable
 *
 * Internally checks whether the token is permittable
 *
 * If not permittable or not able to tell, returns undefined
 */
export function useFakePermitHookData(): PermitHookData | undefined {
  const params = usePermitHookParams()

  const [data, setData] = useState<PermitHookData | undefined>(undefined)

  useEffect(() => {
    if (!params) return

    generatePermitHook(params).then(setData)
  }, [params])

  return data
}

function usePermitHookParams(): PermitHookParams | undefined {
  const { chainId } = useWalletInfo()
  const { provider } = useWeb3React()

  const { state } = useDerivedTradeState()
  const { inputCurrency } = state || {}

  const permitInfo = useIsTokenPermittable(inputCurrency)

  return useSafeMemo(() => {
    if (!inputCurrency || !provider || !permitInfo) return undefined
    return {
      chainId,
      provider,
      inputToken: inputCurrency as Token,
      permitInfo,
    }
  }, [inputCurrency, provider, permitInfo, chainId])
}
