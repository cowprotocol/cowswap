import { useEffect, useState } from 'react'

import { isSupportedPermitInfo, PermitHookData } from '@cowprotocol/permit-utils'

import { useDerivedTradeState } from 'modules/trade'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useGeneratePermitHook } from './useGeneratePermitHook'
import { usePermitInfo } from './usePermitInfo'

import { GeneratePermitHookParams } from '../types'

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

  const permitInfo = usePermitInfo(inputCurrency, tradeType)

  return useSafeMemo(() => {
    if (!inputCurrency || !('address' in inputCurrency) || !isSupportedPermitInfo(permitInfo)) return undefined

    return {
      inputToken: { address: inputCurrency.address, name: inputCurrency.name },
      permitInfo,
    }
  }, [inputCurrency, permitInfo])
}
