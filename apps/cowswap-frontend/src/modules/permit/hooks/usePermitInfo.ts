import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { DEFAULT_MIN_GAS_LIMIT, getTokenPermitInfo, PermitInfo } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { TradeType } from 'modules/trade/types'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'

import { usePreGeneratedPermitInfoForToken } from './usePreGeneratedPermitInfoForToken'

import { addPermitInfoForTokenAtom, permittableTokensAtom } from '../state/permittableTokensAtom'
import { IsTokenPermittableResult } from '../types'

const ORDER_TYPE_SUPPORTS_PERMIT: Record<TradeType, boolean> = {
  [TradeType.SWAP]: true,
  [TradeType.LIMIT_ORDER]: true,
  [TradeType.ADVANCED_ORDERS]: false,
  [TradeType.YIELD]: true,
}

const UNSUPPORTED: PermitInfo = { type: 'unsupported', name: 'native' }

export const PERMIT_GAS_LIMIT_MIN: Record<SupportedChainId, number> = mapSupportedNetworks(DEFAULT_MIN_GAS_LIMIT)

/**
 * Check whether the token is permittable, and returns the permit info for it
 * Tries to find it out from the pre-generated list
 * If not found, tries to load the info from chain
 * The result will be cached on localStorage if a final conclusion is found
 *
 * When it is, returned type is `{type: 'dai-like' | 'eip-2612', gasLimit: number}
 * When it is not, returned type is `{type: 'unsupported'}`
 * When it is unknown, returned type is `undefined`
 */
// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function usePermitInfo(
  token: Nullish<Currency>,
  tradeType: Nullish<TradeType>,
  customSpender?: string,
): IsTokenPermittableResult {
  const { chainId } = useWalletInfo()
  const provider = useWalletProvider()

  const lowerCaseAddress = token ? getWrappedToken(token).address?.toLowerCase() : undefined
  const isNative = !!token && getIsNativeToken(token)

  // Avoid building permit info in the first place if order type is not supported
  const isPermitSupported = !!tradeType && ORDER_TYPE_SUPPORTS_PERMIT[tradeType]

  const isPermitEnabled = useIsPermitEnabled() && isPermitSupported

  const addPermitInfo = useAddPermitInfo()
  const permitInfo = usePermitInfoState(chainId, isPermitEnabled ? lowerCaseAddress : undefined)
  const { permitInfo: preGeneratedInfo, isLoading: preGeneratedIsLoading } = usePreGeneratedPermitInfoForToken(
    isPermitEnabled && !isNative ? token : undefined,
  )

  const spender = customSpender || COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

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

    const minGasLimit = PERMIT_GAS_LIMIT_MIN[chainId]

    getTokenPermitInfo({ spender, tokenAddress: lowerCaseAddress, chainId, provider, minGasLimit }).then((result) => {
      if ('error' in result) {
        // When error, we don't know. Log and don't cache.
        console.debug(
          `useIsTokenPermittable: failed to check whether token ${lowerCaseAddress} is permittable: ${result.error}`,
        )
      } else {
        // TODO: there is a Single Responsibility Principle breach here. This hook should not be responsible for caching.
        // TODO: better to create a separate updater for caching.
        // Otherwise, we know it is permittable or not. Cache it.
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
  ])

  if (isNative) {
    return UNSUPPORTED
  }

  return preGeneratedInfo ?? permitInfo
}

/**
 * Returns a callback for adding PermitInfo for a given token
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useAddPermitInfo() {
  return useSetAtom(addPermitInfoForTokenAtom)
}

function usePermitInfoState(chainId: SupportedChainId, tokenAddress: string | undefined): IsTokenPermittableResult {
  const permitableTokens = useAtomValue(permittableTokensAtom)

  return useMemo(() => {
    if (!tokenAddress) return undefined

    return permitableTokens[chainId]?.[tokenAddress.toLowerCase()]
  }, [chainId, permitableTokens, tokenAddress])
}
