import { FormEvent, ReactNode, useCallback, useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import {
  PartnerCodeAvailability,
  useAffiliatePartnerCodeAvailability,
} from '../hooks/useAffiliatePartnerCodeAvailability'
import { useAffiliatePartnerCodeCreate } from '../hooks/useAffiliatePartnerCodeCreate'
import { type AffiliatePartnerCodeCreateError } from '../lib/affiliatePartnerCodeCreateError'
import { formatRefCode, generateSuggestedCode, isSupportedPayoutsNetwork } from '../lib/affiliateProgramUtils'
import { AffiliatePartnerCodeForm } from '../pure/AffiliatePartner/AffiliatePartnerCodeForm'

export function AffiliatePartnerCodeCreation(): ReactNode {
  const { account, chainId } = useWalletInfo()
  const provider = useWalletProvider()

  const isCreateEnabled = !!account && !!provider && isSupportedPayoutsNetwork(chainId)

  const [error, setError] = useState<AffiliatePartnerCodeCreateError | undefined>()
  const [inputCode, setInputCode] = useState(generateSuggestedCode())
  const isCodeValid = Boolean(formatRefCode(inputCode))

  const availability = useAffiliatePartnerCodeAvailability(inputCode, isCreateEnabled && isCodeValid, setError)
  const { submitting: isSubmitting, onCreate } = useAffiliatePartnerCodeCreate({
    account,
    provider,
    code: inputCode,
    setError,
  })

  const showInvalidFormat = !!inputCode && !isCodeValid
  const canSubmit =
    isCreateEnabled && isCodeValid && availability === PartnerCodeAvailability.Available && !isSubmitting

  const onCodeChange = useCallback((event: FormEvent<HTMLInputElement>): void => {
    setInputCode(event.currentTarget.value.trim().toUpperCase())
  }, [])

  const onGenerate = useCallback((): void => {
    setInputCode(generateSuggestedCode())
  }, [])

  return (
    <AffiliatePartnerCodeForm
      value={inputCode}
      onChange={onCodeChange}
      showInvalidFormat={showInvalidFormat}
      availability={availability}
      canSubmit={canSubmit}
      submitting={isSubmitting}
      error={error}
      onCreate={onCreate}
      onGenerate={onGenerate}
    />
  )
}
