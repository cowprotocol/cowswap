import { useMemo } from 'react'

import { RwaTokenStatus, useRwaTokenStatus } from 'modules/rwa/hooks/useRwaTokenStatus'
import { UserConsent, buildUserConsent } from 'modules/rwa/types/rwaConsent'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

export interface UserConsentsMetadata {
  userConsents: UserConsent[]
}

export function useRwaConsentForAppData(): UserConsentsMetadata | undefined {
  const derivedState = useDerivedTradeState()

  const inputCurrency = derivedState?.inputCurrency ?? undefined
  const outputCurrency = derivedState?.outputCurrency ?? undefined

  // todo replace with wrap
  const inputToken = inputCurrency?.isToken ? inputCurrency : undefined
  const outputToken = outputCurrency?.isToken ? outputCurrency : undefined

  const { status, rwaTokenInfo } = useRwaTokenStatus({ inputToken, outputToken })

  return useMemo(() => {
    if (status !== RwaTokenStatus.ConsentIsSigned || !rwaTokenInfo) {
      return undefined
    }

    return {
      userConsents: [buildUserConsent(rwaTokenInfo.tosHash)],
    }
  }, [status, rwaTokenInfo])
}
