import { KeyboardEvent, ReactNode, useCallback } from 'react'

import { HelpTooltip, ButtonPrimary, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { RotateCw } from 'react-feather'
import styled from 'styled-components/macro'

import { REF_CODE_MIN_LENGTH } from 'modules/affiliate'

import { AffiliatePartnerCodeErrorMessage } from './AffiliatePartnerCodeErrorMessage'

import { PartnerCodeAvailability } from '../../hooks/useAffiliatePartnerCodeAvailability'
import { AffiliatePartnerCodeCreateError } from '../../lib/affiliatePartnerCodeCreateError'
import { StatusText } from '../AffiliateBadges.shared'
import { CardTitle } from '../AffiliateCards.shared'
import { Form, HelperText, Label, LabelActions, LabelRow } from '../AffiliateLayout.shared'
import { BottomMetaRow, LabelContent } from '../AffiliateMetrics.shared'
import { type RefCodeAdornmentVariant } from '../RefCodeInput/RefCodeAdornment'
import { RefCodeInput, RefCodeInputProps } from '../RefCodeInput/RefCodeInput'

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
            <Label>
              <LabelContent>
                <Trans>Referral code</Trans>
                <HelpTooltip text={t`Referral codes contain 5-20 uppercase letters, numbers, dashes, or underscores`} />
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

const MiniAction = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-transform: lowercase;

  &:hover:not(:disabled) {
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

const PrimaryAction = styled(ButtonPrimary)`
  width: 100%;
`
