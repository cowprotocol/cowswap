import { KeyboardEvent, ReactNode, useCallback, useId } from 'react'

import { HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { RotateCw } from 'react-feather'

import { REF_CODE_MIN_LENGTH } from 'modules/affiliate'

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
  const hasError = showInvalidFormat || error === AffiliatePartnerCodeCreateError.Unavailable
  const referralCodeInputId = useId()

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
          Pick something memorable or let us generate one for you. Once saved, your code is permanently linked to your
          wallet, so choose wisely. Your code never reveals your wallet address.
        </Trans>
      </HelperText>
      <BottomMetaRow>
        <Form>
          <LabelRow>
            <Label htmlFor={referralCodeInputId}>
              <LabelContent>
                <Trans>Referral code</Trans>
                <HelpTooltip
                  text={t`Referral codes contain 5-20 uppercase letters, numbers, dashes, or underscores`}
                  dimmed
                />
              </LabelContent>
            </Label>
            <LabelActions>
              <MiniAction onClick={onGenerate} disabled={submitting}>
                <Trans>Generate</Trans>
                <RotateCw size={10} strokeWidth={3} />
              </MiniAction>
            </LabelActions>
          </LabelRow>
          <RefCodeInput
            id={referralCodeInputId}
            isLoading={submitting}
            hasError={hasError}
            disabled={submitting}
            adornmentVariant={ADORNMENT_VARIANT_MAP[availability]}
            onKeyDown={handleInputKeyDown}
            {...rest}
          />
          {showInvalidFormat && (
            <StatusText $variant="error">
              {/* we only check the lower limit because the upper limit is enforced by the input */}
              {typeof rest?.value === 'string' && rest.value.length < REF_CODE_MIN_LENGTH ? (
                <Trans>The code must be at least {REF_CODE_MIN_LENGTH} characters long.</Trans>
              ) : (
                <Trans>Only A-Z, 0-9, dashes, and underscores are allowed.</Trans>
              )}
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
