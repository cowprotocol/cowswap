import { KeyboardEvent, ReactNode, useCallback } from 'react'

import { HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { RotateCw } from 'react-feather'

import { AffiliatePartnerCodeErrorMessage } from './AffiliatePartnerCodeErrorMessage'

import { PartnerCodeAvailability } from '../../hooks/useAffiliatePartnerCodeAvailability'
import { AffiliatePartnerCodeCreateError } from '../../lib/affiliatePartnerCodeCreateError'
import { type RefCodeAdornmentVariant } from '../RefCodeInput/RefCodeAdornment'
import { RefCodeInput, RefCodeInputProps } from '../RefCodeInput/RefCodeInput'
import {
  BottomMetaRow,
  CardTitle,
  Form,
  HelperText,
  Label,
  LabelActions,
  LabelContent,
  LabelRow,
  MiniAction,
  PrimaryAction,
  StatusText,
} from '../shared'

type AffiliatePartnerCodeFormRefInputProps = Omit<RefCodeInputProps, 'disabled' | 'isLoading' | 'hasError'>

interface AffiliatePartnerCodeFormProps extends AffiliatePartnerCodeFormRefInputProps {
  availability: PartnerCodeAvailability
  showInvalidFormat: boolean
  canSubmit: boolean
  submitting: boolean
  error?: AffiliatePartnerCodeCreateError
  onGenerate: () => void
  onCreate: () => void
}

export function AffiliatePartnerCodeForm({
  availability,
  showInvalidFormat,
  canSubmit,
  submitting,
  error,
  onGenerate,
  onCreate,
  ...rest
}: AffiliatePartnerCodeFormProps): ReactNode {
  const hasError = showInvalidFormat || error?.code === 'unavailable'

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key !== 'Enter') return

      event.preventDefault()
      onCreate()
    },
    [onCreate],
  )

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
            <Label>
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
          <RefCodeInput
            isLoading={submitting}
            hasError={hasError}
            disabled={submitting}
            adornmentVariant={ADORNMENT_VARIANT_MAP[availability]}
            compactSize
            onKeyDown={handleInputKeyDown}
            {...rest}
          />
          {showInvalidFormat && (
            <StatusText $variant="error">
              <Trans>Only A-Z, 0-9, dashes, and underscores are allowed.</Trans>
            </StatusText>
          )}
          <PrimaryAction onClick={onCreate} disabled={!canSubmit}>
            {submitting ? t`Signing...` : t`Save & lock code`}
          </PrimaryAction>
          <AffiliatePartnerCodeErrorMessage error={error} />
        </Form>
      </BottomMetaRow>
    </>
  )
}

const ADORNMENT_VARIANT_MAP: Record<PartnerCodeAvailability, RefCodeAdornmentVariant | undefined> = {
  [PartnerCodeAvailability.Idle]: undefined,
  [PartnerCodeAvailability.Checking]: 'checking',
  [PartnerCodeAvailability.Available]: 'available',
  [PartnerCodeAvailability.Unavailable]: 'error',
}
