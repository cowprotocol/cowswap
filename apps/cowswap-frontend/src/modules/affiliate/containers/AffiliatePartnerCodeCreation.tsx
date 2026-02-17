import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { HelpTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { RotateCw } from 'react-feather'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'
import { useAffiliatePartnerCodeAvailability } from 'modules/affiliate/hooks/useAffiliatePartnerCodeAvailability'
import { useAffiliatePartnerInfo } from 'modules/affiliate/hooks/useAffiliatePartnerInfo'
import { buildPartnerTypedData, generateSuggestedCode } from 'modules/affiliate/lib/affiliateProgramUtils'
import { ReferralCodeInputRow, TrailingIconKind } from 'modules/affiliate/pure/ReferralCodeInput/ReferralCodeInputRow'
import {
  BottomMetaRow,
  CardTitle,
  Form,
  HelperText,
  InlineError,
  Label,
  LabelActions,
  LabelContent,
  LabelRow,
  MiniAction,
  PrimaryAction,
  StatusText,
} from 'modules/affiliate/pure/shared'

type AffiliateCodeError = Error & { status?: number; code?: number }
type CodeAvailability = ReturnType<typeof useAffiliatePartnerCodeAvailability>['availability']

function isAffiliateNetworkError(error: AffiliateCodeError): boolean {
  if (typeof error.status === 'number') {
    return false
  }

  const message = error.message || ''
  return message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('Load failed')
}

function mapErrorCodeToErrorMessage(error: AffiliateCodeError): string {
  if (isAffiliateNetworkError(error)) {
    return t`Affiliate service is unreachable. Try again later.`
  }

  if (error.code === 4001) {
    return t`Signature request rejected.`
  }

  if (error.status === 409) {
    return t`Code already taken or wallet already linked.`
  }

  if (error.status === 401) {
    return t`Signature invalid. Please try again.`
  }

  if (error.status === 403) {
    return t`That code is unavailable. Try another.`
  }

  if (error.status === 422) {
    return t`Unsupported network.`
  }

  if (error.status === 400) {
    return t`Invalid request.`
  }

  return error.message || t`Unable to create affiliate code.`
}

function getCreateValidationError(params: {
  account: string | undefined
  isMainnet: boolean
  isCodeValid: boolean
  provider: ReturnType<typeof useWalletProvider>
  availability: CodeAvailability
}): string | null {
  const { account, isMainnet, isCodeValid, provider, availability } = params

  if (!account) return t`Connect your wallet to create a code.`
  if (!isMainnet) return t`Switch to Ethereum mainnet to create a code.`
  if (!isCodeValid) return t`Enter a code with 5-20 characters (A-Z, 0-9, - or _).`
  if (!provider) return t`Wallet signer unavailable.`
  if (availability === 'unavailable' || availability === 'error') return t`That code is unavailable. Try another.`

  return null
}

type AffiliatePartnerCodeCreationFormProps = {
  inputCode: string
  availability: CodeAvailability
  canSave: boolean
  submitting: boolean
  errorMessage: string | null
  onGenerate: () => void
  onCodeChange: (code: string) => void
  onCreate: () => void
}

function getTrailingIconKind(availability: CodeAvailability): TrailingIconKind | undefined {
  if (availability === 'checking') {
    return 'pending'
  }
  if (availability === 'available') {
    return 'success'
  }
  if (availability === 'unavailable' || availability === 'invalid' || availability === 'error') {
    return 'error'
  }

  return undefined
}

function AffiliatePartnerCodeValidationErrors({
  showCodeUnavailable,
  showInvalidFormat,
}: {
  showCodeUnavailable: boolean
  showInvalidFormat: boolean
}): ReactNode {
  return (
    <>
      {showCodeUnavailable && (
        <InlineError>
          <Trans>This code is taken. Generate another one.</Trans>
        </InlineError>
      )}
      {showInvalidFormat && (
        <InlineError>
          <Trans>Only A-Z, 0-9, dashes, and underscores are allowed.</Trans>
        </InlineError>
      )}
    </>
  )
}

function AffiliatePartnerCodeCreationForm({
  inputCode,
  availability,
  canSave,
  submitting,
  errorMessage,
  onGenerate,
  onCodeChange,
  onCreate,
}: AffiliatePartnerCodeCreationFormProps): ReactNode {
  const showCodeUnavailable = availability === 'unavailable'
  const showInvalidFormat = availability === 'invalid'
  const trailingIconKind = getTrailingIconKind(availability)

  return (
    <>
      <CardTitle>
        <Trans>Create your referral code</Trans>
      </CardTitle>
      <HelperText>
        <Trans>
          Type or generate a code (subject to availability). Saving locks this code to your wallet and cannot be
          changed. Links/codes don't reveal your wallet.
        </Trans>
      </HelperText>
      <BottomMetaRow>
        <Form>
          <LabelRow>
            <Label htmlFor="affiliate-code">
              <LabelContent>
                <Trans>Referral code</Trans>
                <HelpTooltip text={t`Referral codes contain 5-20 uppercase letters, numbers, dashes, or underscores`} />
              </LabelContent>
            </Label>
            <LabelActions>
              <MiniAction onClick={onGenerate} disabled={submitting}>
                <Trans>generate</Trans>
                <RotateCw size={10} strokeWidth={3} />
              </MiniAction>
            </LabelActions>
          </LabelRow>
          <ReferralCodeInputRow
            displayCode={inputCode}
            hasError={showInvalidFormat || showCodeUnavailable || trailingIconKind === 'error'}
            isInputDisabled={submitting}
            isEditing
            isLinked={false}
            trailingIconKind={trailingIconKind}
            canSubmitSave={canSave}
            onChange={(event: FormEvent<HTMLInputElement>) => onCodeChange(event.currentTarget.value)}
            onPrimaryClick={onCreate}
            onSave={onCreate}
            isLoading={trailingIconKind === 'pending'}
            inputId="affiliate-code"
            placeholder={t`Enter your code`}
            size="compact"
            trailingIconLabels={{
              pending: <Trans>Checking</Trans>,
              success: <Trans>Available</Trans>,
            }}
            trailingIconTitles={{
              pending: t`Checking`,
              success: t`Available`,
            }}
          />
          <AffiliatePartnerCodeValidationErrors
            showCodeUnavailable={showCodeUnavailable}
            showInvalidFormat={showInvalidFormat}
          />
          <PrimaryAction onClick={onCreate} disabled={!canSave} data-testid="affiliate-start-confirm">
            {submitting ? t`Signing...` : t`Save & lock code`}
          </PrimaryAction>
          {errorMessage && <StatusText $variant="error">{errorMessage}</StatusText>}
        </Form>
      </BottomMetaRow>
    </>
  )
}

export function AffiliatePartnerCodeCreation(): ReactNode {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { account, chainId } = useWalletInfo()
  const isMainnet = chainId === SupportedChainId.MAINNET
  const provider = useWalletProvider()
  const { data: partnerInfo, mutate: mutatePartnerInfo } = useAffiliatePartnerInfo(account)
  const existingCode = partnerInfo?.code
  const [submitting, setSubmitting] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [hasEdited, setHasEdited] = useState(false)

  const showCreateForm = !!account && isMainnet && !existingCode && !!provider
  const { normalizedCode, isCodeValid, availability, availabilityErrorMessage } = useAffiliatePartnerCodeAvailability({
    inputCode,
    canVerify: showCreateForm && !!chainId,
  })

  useEffect(() => {
    if (!showCreateForm || hasEdited || inputCode) return

    setInputCode(generateSuggestedCode())
  }, [hasEdited, inputCode, showCreateForm])

  useEffect(() => {
    if (availabilityErrorMessage) {
      setErrorMessage(availabilityErrorMessage)
    }
  }, [availabilityErrorMessage, setErrorMessage])

  const onCreate = useCallback(async (): Promise<void> => {
    const validationError = getCreateValidationError({ account, isMainnet, isCodeValid, provider, availability })
    if (validationError) {
      setErrorMessage(validationError)
      return
    }
    if (!account || !provider) return

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const signer = provider.getSigner()
      const typedData = buildPartnerTypedData({
        walletAddress: account,
        code: normalizedCode,
        chainId: SupportedChainId.MAINNET,
      })
      const signedMessage = await signer._signTypedData(typedData.domain, typedData.types, typedData.message)

      await bffAffiliateApi.createAffiliateCode({
        code: normalizedCode,
        walletAddress: account,
        signedMessage,
      })
      await mutatePartnerInfo()
    } catch (error) {
      setErrorMessage(mapErrorCodeToErrorMessage(error as AffiliateCodeError))
    } finally {
      setSubmitting(false)
    }
  }, [account, availability, isCodeValid, isMainnet, mutatePartnerInfo, normalizedCode, provider, setErrorMessage])

  const onCodeChange = useCallback(
    (code: string) => {
      setHasEdited(true)
      setErrorMessage(null)
      setInputCode(code.trim().toUpperCase())
    },
    [setErrorMessage],
  )

  const onGenerate = useCallback(() => {
    setHasEdited(true)
    setErrorMessage(null)
    setInputCode(generateSuggestedCode())
  }, [setErrorMessage])

  const canSave = showCreateForm && isCodeValid && availability === 'available' && !submitting

  return (
    <AffiliatePartnerCodeCreationForm
      inputCode={inputCode}
      availability={availability}
      canSave={canSave}
      submitting={submitting}
      errorMessage={errorMessage}
      onGenerate={onGenerate}
      onCodeChange={onCodeChange}
      onCreate={onCreate}
    />
  )
}
