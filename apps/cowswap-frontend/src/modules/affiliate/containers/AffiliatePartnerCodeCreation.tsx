import { FormEvent, ReactNode, useCallback, useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useWalletClient } from 'wagmi'

import {
  PartnerCodeAvailability,
  useAffiliatePartnerCodeAvailability,
} from '../hooks/useAffiliatePartnerCodeAvailability'
import { useAffiliatePartnerCodeCreate } from '../hooks/useAffiliatePartnerCodeCreate'
import { AffiliatePartnerCodeCreateError } from '../lib/affiliatePartnerCodeCreateError'
import { formatRefCode, generateSuggestedCode, isSupportedPayoutsNetwork } from '../lib/affiliateProgramUtils'
import { AffiliatePartnerCodeForm } from '../pure/AffiliatePartner/AffiliatePartnerCodeForm'

export function AffiliatePartnerCodeCreation(): ReactNode {
  const { account, chainId } = useWalletInfo()
  const { data: walletClient } = useWalletClient()

  const isCreateEnabled = !!account && !!walletClient && isSupportedPayoutsNetwork(chainId)

  const [error, setError] = useState<AffiliatePartnerCodeCreateError | undefined>()
  const [inputCode, setInputCode] = useState(generateSuggestedCode())
  const isInputValid = Boolean(formatRefCode(inputCode))

  const availability = useAffiliatePartnerCodeAvailability(inputCode, isCreateEnabled && isInputValid, setError)
  const { submitting, onCreate } = useAffiliatePartnerCodeCreate({
    account,
    walletClient,
    code: inputCode,
    setError,
  })

  const showInvalidFormat = !!inputCode && !isInputValid
  const canSubmit = isCreateEnabled && isInputValid && availability === PartnerCodeAvailability.Available && !submitting

  const onCodeChange = useCallback((event: FormEvent<HTMLInputElement>): void => {
    setInputCode(event.currentTarget.value.trim().toUpperCase())
    setError(undefined)
  }, [])

  const onGenerate = useCallback((): void => {
    setInputCode(generateSuggestedCode())
    setError(undefined)
  }, [])

  return (
    <AffiliatePartnerCodeForm
      value={inputCode}
      onChange={onCodeChange}
      showInvalidFormat={showInvalidFormat}
      availability={availability}
      canSubmit={canSubmit}
      submitting={submitting}
      error={availability === PartnerCodeAvailability.Unavailable ? AffiliatePartnerCodeCreateError.Unavailable : error}
      onCreate={onCreate}
      onGenerate={onGenerate}
    />
  )
}
