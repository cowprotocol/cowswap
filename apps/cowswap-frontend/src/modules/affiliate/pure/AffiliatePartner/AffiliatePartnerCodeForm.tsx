import { KeyboardEvent, ReactNode, useCallback, useId } from 'react'

import { CopyButton, HelpTooltip, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { RotateCw } from 'react-feather'
import styled from 'styled-components/macro'

import { REF_CODE_MIN_LENGTH } from 'modules/affiliate'

import { AffiliatePartnerCodeErrorMessage } from './AffiliatePartnerCodeErrorMessage'

import { PartnerCodeAvailability } from '../../hooks/useAffiliatePartnerCodeAvailability'
import { AffiliatePartnerCodeCreateError } from '../../lib/affiliatePartnerCodeCreateError'
import { formatRefCode, getReferralLink } from '../../lib/affiliateProgramUtils'
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
  LinkedCard,
  LinkedCopy,
  LinkedLinkRow,
  LinkedLinkText,
  MiniAction,
  PrimaryAction,
  StatusText,
} from '../shared'

interface AffiliatePartnerCodeFormProps extends AffiliatePartnerCodeFormRefInputProps {
  availability: PartnerCodeAvailability
  showInvalidFormat: boolean
  canSubmit: boolean
  submitting: boolean
  error?: AffiliatePartnerCodeCreateError
  onGenerate: () => void
  onCreate: () => void
}

type AffiliatePartnerCodeFormRefInputProps = Omit<RefCodeInputProps, 'disabled' | 'isLoading' | 'hasError'>

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
  const inputValue = typeof rest.value === 'string' ? rest.value : undefined
  const formattedCode = formatRefCode(inputValue)
  const previewLink = getReferralLink(formattedCode || '')
  const isPreviewCopyDisabled = !formattedCode

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key !== 'Enter' || !canSubmit) return

      event.preventDefault()
      onCreate()
    },
    [onCreate, canSubmit],
  )

  return (
    <>
      <CardTitle>
        <Trans>Your referral code</Trans>
      </CardTitle>
      <HelperText>
        <Trans>
          Pick your own code or generate one. Once saved, it becomes permanently linked to your wallet, without ever
          revealing your wallet address.
        </Trans>
      </HelperText>
      <BottomMetaRow>
        <Form>
          <LabelRow>
            <Label htmlFor={referralCodeInputId}>
              <LabelContent>
                <Trans>Referral code</Trans>
                <HelpTooltip
                  text={
                    <Trans>Referral codes contain 5-20 uppercase letters (A-Z), numbers, dashes, or underscores</Trans>
                  }
                  dimmed
                />
              </LabelContent>
            </Label>
            <LabelActions>
              <MiniAction onClick={onGenerate} disabled={submitting}>
                <Trans>Suggest one</Trans>
                <RotateCw size={10} strokeWidth={3} />
              </MiniAction>
            </LabelActions>
          </LabelRow>
          <ConnectedInputStack>
            <RefCodeInput
              id={referralCodeInputId}
              isLoading={submitting}
              hasError={hasError}
              disabled={submitting}
              adornmentVariant={ADORNMENT_VARIANT_MAP[availability]}
              onKeyDown={handleInputKeyDown}
              placeholder={t`Your-code`}
              connectedBelow
              {...rest}
            />
            <ReferralLinkPreview previewLink={previewLink} isCopyDisabled={isPreviewCopyDisabled} />
          </ConnectedInputStack>
          {showInvalidFormat && (
            <StatusText $variant="error">
              {/* we only check the lower limit because the upper limit is enforced by the input */}
              {inputValue && inputValue.length < REF_CODE_MIN_LENGTH ? (
                <Trans>The code must be at least {REF_CODE_MIN_LENGTH} characters long.</Trans>
              ) : (
                <Trans>Only A-Z, 0-9, dashes, and underscores are allowed.</Trans>
              )}
            </StatusText>
          )}
          <AffiliatePartnerCodeErrorMessage error={error} />
          <PrimaryAction onClick={onCreate} disabled={!canSubmit}>
            {submitting ? t`Signing...` : t`Save & lock code`}
          </PrimaryAction>
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

interface ReferralLinkPreviewProps {
  previewLink: string
  isCopyDisabled: boolean
}

function ReferralLinkPreview({ previewLink, isCopyDisabled }: ReferralLinkPreviewProps): ReactNode {
  return (
    <ConnectedPreviewCard>
      <LinkedLinkRow>
        <LinkedCopy>
          <CopyButton
            value={previewLink}
            iconSize={16}
            iconOnly
            disabled={isCopyDisabled}
            aria-label={isCopyDisabled ? t`Enter a code to copy the referral link` : t`Copy referral link`}
          />
          <LinkedLinkText>
            {previewLink
              .split(/(ref=)/)
              .map((part, index) => (part === 'ref=' ? part : index > 1 ? <strong key={index}>{part}</strong> : part))}
          </LinkedLinkText>
        </LinkedCopy>
      </LinkedLinkRow>
    </ConnectedPreviewCard>
  )
}

const ConnectedInputStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
`

const ConnectedPreviewCard = styled(LinkedCard)`
  border-top: 0;
  border-radius: 0 0 9px 9px;
  border-color: var(${UI.COLOR_BORDER});
`
