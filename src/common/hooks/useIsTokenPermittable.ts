import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { Nullish } from 'types'

import { useWalletInfo } from 'modules/wallet'

import { estimatePermit } from 'utils/permitTokenChecker'

export type SupportedPermitInfo = {
  type: 'dai' | 'permit'
  gasLimit: number
}
type UnsupportedPermitInfo = false
type PermitInfo = SupportedPermitInfo | UnsupportedPermitInfo
export type IsTokenPermittableResult = PermitInfo | undefined

// TODO: store on localStorage as this won't change
const PERMITTABLE_TOKENS_CACHE: Record<SupportedChainId, Record<string, PermitInfo>> = {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.GOERLI]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
}

export function useIsTokenPermittable(token: Nullish<Currency>): IsTokenPermittableResult {
  const { chainId } = useWalletInfo()
  const { provider } = useWeb3React()

  const lowerCaseAddress = token?.wrapped?.address?.toLowerCase()
  const isNative = token?.isNative
  const tokenName = token?.name || lowerCaseAddress || ''

  useEffect(() => {
    console.debug(
      `bug--useIsTokenPermittable--useEffect`,
      chainId,
      lowerCaseAddress,
      tokenName,
      PERMITTABLE_TOKENS_CACHE[chainId]
    )
    if (!chainId || !lowerCaseAddress || !provider || PERMITTABLE_TOKENS_CACHE[chainId][lowerCaseAddress]) {
      return
    }

    estimatePermit(lowerCaseAddress, tokenName, chainId, provider).then((result) => {
      if (!result) {
        // When falsy, we know it doesn't support permit. Cache it.
        PERMITTABLE_TOKENS_CACHE[chainId][lowerCaseAddress] = false
      } else if ('error' in result) {
        // When error, we don't know. Log and don't cache.
        console.debug(
          `useIsTokenPermittable: failed to check whether token ${lowerCaseAddress} is permittable: ${result.error}`
        )
      } else {
        // Otherwise, we know it is permittable. Cache it.
        PERMITTABLE_TOKENS_CACHE[chainId][lowerCaseAddress] = result
      }
    })
  }, [chainId, lowerCaseAddress, provider, tokenName])

  if (isNative) {
    return false
  }

  return chainId && lowerCaseAddress ? PERMITTABLE_TOKENS_CACHE[chainId][lowerCaseAddress] : undefined
}
