import { useEffect, useState } from 'react'

import { Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { useDerivedTradeState } from 'modules/trade'
import { useWalletInfo } from 'modules/wallet'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useIsTokenPermittable } from './useIsTokenPermittable'

import { PermitHookData, PermitHookParams } from '../types'
import { generatePermitHook } from '../utils/generatePermitHook'

/**
 * Returns PermitHookData using an account agnostic signer if inputCurrency is permittable
 *
 * Internally checks whether the token is permittable
 *
 * If not permittable or not able to tell, returns undefined
 */
export function useAccountAgnosticPermitHookData(): PermitHookData | undefined {
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
