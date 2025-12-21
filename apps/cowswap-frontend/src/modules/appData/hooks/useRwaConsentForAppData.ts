import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useRwaConsentStatus } from 'modules/rwa/hooks/useRwaConsentStatus'
import { RwaTokenStatus, useRwaTokenStatus } from 'modules/rwa/hooks/useRwaTokenStatus'
import { buildUserConsent, RwaConsentKey, UserConsent } from 'modules/rwa/types/rwaConsent'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

export interface UserConsentsMetadata {
  userConsents: UserConsent[]
}

export function useRwaConsentForAppData(): UserConsentsMetadata | undefined {
  const { account } = useWalletInfo()
  const derivedState = useDerivedTradeState()

  const inputCurrency = derivedState?.inputCurrency
  const outputCurrency = derivedState?.outputCurrency

  const { status, rwaTokenInfo } = useRwaTokenStatus({ inputCurrency, outputCurrency })

  const consentKey: RwaConsentKey | null = useMemo(() => {
    if (!rwaTokenInfo || !account) {
      return null
    }
    return {
      wallet: account,
      ipfsHash: rwaTokenInfo.tosHash,
    }
  }, [rwaTokenInfo, account])

  const { consentRecord } = useRwaConsentStatus(consentKey)

  return useMemo(() => {
    if (status !== RwaTokenStatus.ConsentIsSigned || !rwaTokenInfo || !consentRecord?.acceptedAt) {
      return undefined
    }

    return {
      userConsents: [buildUserConsent(rwaTokenInfo.tosHash, consentRecord.acceptedAt)],
    }
  }, [status, rwaTokenInfo, consentRecord])
}
