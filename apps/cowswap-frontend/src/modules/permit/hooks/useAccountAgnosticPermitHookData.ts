import { useEffect, useMemo, useState } from 'react'

import { getAddress } from '@cowprotocol/common-utils'
import { isSupportedPermitInfo, PermitHookData } from '@cowprotocol/permit-utils'

import { useDerivedTradeState } from 'modules/trade'

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
  const state = useDerivedTradeState()
  const { inputCurrency, tradeType } = state || {}

  const permitInfo = usePermitInfo(inputCurrency, tradeType)

  const address = getAddress(inputCurrency)
  const name = inputCurrency?.name

  return useMemo(() => {
    if (!address || !isSupportedPermitInfo(permitInfo)) return undefined

    return {
      inputToken: { address, name },
      permitInfo,
    }
  }, [address, name, permitInfo])
}
