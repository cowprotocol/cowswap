import { useMemo } from 'react'

import { RwaTokenStatus, useRwaTokenStatus } from 'modules/rwa/hooks/useRwaTokenStatus'
import { RwaUserConsent, buildRwaUserConsent } from 'modules/rwa/types/rwaConsent'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

export interface RwaUserConsentsMetadata {
  rwaUserConsents: RwaUserConsent[]
}

export function useRwaConsentForAppData(): RwaUserConsentsMetadata | undefined {
  const derivedState = useDerivedTradeState()

  const inputCurrency = derivedState?.inputCurrency ?? undefined
  const outputCurrency = derivedState?.outputCurrency ?? undefined

  const inputToken = inputCurrency?.isToken ? inputCurrency : undefined
  const outputToken = outputCurrency?.isToken ? outputCurrency : undefined

  const { status, rwaTokenInfo } = useRwaTokenStatus({ inputToken, outputToken })

  return useMemo(() => {
    if (status !== RwaTokenStatus.ConsentIsSigned || !rwaTokenInfo) {
      return undefined
    }

    return {
      rwaUserConsents: [buildRwaUserConsent(rwaTokenInfo.termsIpfsHash)],
    }
  }, [status, rwaTokenInfo])
}
