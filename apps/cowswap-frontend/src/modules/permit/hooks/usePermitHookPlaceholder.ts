import { useMemo } from 'react'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, getAddress } from '@cowprotocol/common-utils'
import { isNonEvmChain } from '@cowprotocol/cow-sdk'
import { getPermitHookPlaceholder, isSupportedPermitInfo, PermitHookData } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDerivedTradeState } from 'modules/trade'

import { usePermitInfo } from './usePermitInfo'

/**
 * Returns a placeholder permit hook (no signature) if inputCurrency is permittable, so quotes account for the permit gas
 *
 * If not permittable or not able to tell, returns undefined
 */
export function usePermitHookPlaceholder(): PermitHookData | undefined {
  const { chainId, account } = useWalletInfo()
  const state = useDerivedTradeState()
  const { inputCurrency, tradeType } = state || {}

  const permitInfo = usePermitInfo(inputCurrency, tradeType)

  const tokenAddress = getAddress(inputCurrency)

  return useMemo(() => {
    if (!tokenAddress || isNonEvmChain(chainId) || !isSupportedPermitInfo(permitInfo)) return undefined

    return getPermitHookPlaceholder({
      tokenAddress: tokenAddress as `0x${string}`,
      permitInfo,
      spender: COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId] as `0x${string}`,
      owner: account as `0x${string}` | undefined,
    })
  }, [tokenAddress, chainId, permitInfo, account])
}
