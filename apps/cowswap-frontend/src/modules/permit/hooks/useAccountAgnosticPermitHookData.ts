import { useEffect, useState } from 'react'

import { Token } from '@uniswap/sdk-core'

import { useDerivedTradeState } from 'modules/trade'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useGeneratePermitHook } from './useGeneratePermitHook'
import { useIsTokenPermittable } from './useIsTokenPermittable'

import { GeneratePermitHookParams, PermitHookData } from '../types'

/**
 * Returns PermitHookData using an account agnostic signer if inputCurrency is permittable
 *
 * Internally checks whether the token is permittable
 *
 * If not permittable or not able to tell, returns undefined
 */
export function useAccountAgnosticPermitHookData(): PermitHookData | undefined {
  const params = useGeneratePermitHookParams()
  const generatePermitHook = useGeneratePermitHook()

  const [data, setData] = useState<PermitHookData | undefined>(undefined)

  useEffect(() => {
    if (!params) {
      setData(undefined)

      return
    }

    generatePermitHook(params).then(setData)
  }, [generatePermitHook, params])

  return data
}

function useGeneratePermitHookParams(): GeneratePermitHookParams | undefined {
  const { state } = useDerivedTradeState()
  const { inputCurrency, tradeType } = state || {}

  const permitInfo = useIsTokenPermittable(inputCurrency, tradeType)

  return useSafeMemo(() => {
    if (!inputCurrency || !permitInfo) return undefined

    return {
      inputToken: inputCurrency as Token,
      permitInfo,
    }
  }, [inputCurrency, permitInfo])
}
