import { FormEvent, ReactElement, RefObject, useMemo } from 'react'

import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import ICON_QR_CODE from '@cowprotocol/assets/images/icon-qr-code.svg'
import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import { formatShortDate } from '@cowprotocol/common-utils'
import { HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { RotateCw } from 'react-feather'
import SVG from 'react-inlinesvg'

import CopyHelper from 'legacy/components/Copy'

import {
  PartnerCodeAvailabilityState,
} from 'modules/affiliate/hooks/useAffiliatePartnerCodeAvailability'
import {
  ReferralCodeInputRow,
  TrailingIconKind,
} from 'modules/affiliate/pure/ReferralCodeInput/ReferralCodeInputRow'
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
  LinkedActionButton,
  LinkedActionIcon,
  LinkedActions,
  LinkedBadge,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedCopy,
  LinkedFooter,
  LinkedFooterNote,
  LinkedLinkRow,
  LinkedLinkText,
  LinkedMetaList,
  MetricItem,
  MiniAction,
  PrimaryAction,
  RewardsCol1Card,
  StatusText,
} from 'modules/affiliate/pure/shared'

interface AffiliatePartnerCodeCardProps {
  showLinkedFlow: boolean
  codeLoading: boolean
  existingCode: string | null
  createdAt: Date | null
  referralLink: string
  inputCode: string
  availability: PartnerCodeAvailabilityState
  canSave: boolean
  submitting: boolean
  errorMessage: string | null
  onGenerate: () => void
  onInputChange: (event: FormEvent<HTMLInputElement>) => void
  onCreate: () => void
  onOpenQr: () => void
  inputRef: RefObject<HTMLInputElement | null>
}

function getTrailingIconKind(availability: PartnerCodeAvailabilityState): TrailingIconKind | undefined {
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

export function AffiliatePartnerCodeCard({
  showLinkedFlow,
  codeLoading,
  existingCode,
  createdAt,
  referralLink,
  inputCode,
  availability,
  canSave,
  submitting,
  errorMessage,
  onGenerate,
  onInputChange,
  onCreate,
  onOpenQr,
  inputRef,
}: AffiliatePartnerCodeCardProps): ReactElement {
  const showCodeUnavailable = availability === 'unavailable'
  const showInvalidFormat = availability === 'invalid'
  const trailingIconKind = getTrailingIconKind(availability)
  const createdOnLabel = createdAt ? formatShortDate(createdAt) : '-'
  const shareText = useMemo(() => {
    if (!existingCode) {
      return ''
    }
    return encodeURIComponent(`Trade on CoW Swap with my referral code ${existingCode}. ${referralLink} @CoWSwap`)
  }, [existingCode, referralLink])

  return (
    <RewardsCol1Card showLoader={codeLoading}>
      {showLinkedFlow && existingCode ? (
        <>
          <CardTitle>
            <Trans>Your referral code</Trans>
          </CardTitle>
          <LinkedCard>
            <LinkedCodeRow>
              <LinkedCopy>
                <CopyHelper toCopy={existingCode} iconSize={16} hideCopiedLabel />
                <LinkedCodeText>{existingCode}</LinkedCodeText>
              </LinkedCopy>
              <LinkedBadge>
                <SVG src={LockedIcon} width={12} height={10} />
                <Trans>Created</Trans>
              </LinkedBadge>
            </LinkedCodeRow>
            <LinkedLinkRow>
              <LinkedCopy>
                <CopyHelper toCopy={referralLink} iconSize={16} hideCopiedLabel />
                <LinkedLinkText>{referralLink}</LinkedLinkText>
              </LinkedCopy>
            </LinkedLinkRow>
          </LinkedCard>

          <LinkedMetaList>
            <MetricItem>
              <span>
                <Trans>Created on</Trans>
              </span>
              <strong>{createdOnLabel}</strong>
            </MetricItem>
          </LinkedMetaList>

          <LinkedFooter>
            <LinkedFooterNote>
              <Trans>Links/codes don't reveal your wallet.</Trans>
            </LinkedFooterNote>
            <LinkedActions>
              <LinkedActionButton
                as="a"
                href={`https://twitter.com/intent/tweet?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedActionIcon>
                  <SVG src={ICON_SOCIAL_X} width={14} height={14} />
                </LinkedActionIcon>
                <Trans>Share on X</Trans>
              </LinkedActionButton>
              <LinkedActionButton onClick={onOpenQr}>
                <LinkedActionIcon>
                  <SVG src={ICON_QR_CODE} width={14} height={14} />
                </LinkedActionIcon>
                <Trans>Download QR</Trans>
              </LinkedActionButton>
            </LinkedActions>
          </LinkedFooter>
        </>
      ) : (
        <>
          <CardTitle>
            <Trans>Create your referral code</Trans>
          </CardTitle>
          <HelperText>
            <Trans>
              Type or generate a code (subject to availability). Saving locks this code to your wallet and can't be
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
                onChange={onInputChange}
                onPrimaryClick={onCreate}
                onSave={onCreate}
                inputRef={inputRef}
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
              <PrimaryAction onClick={onCreate} disabled={!canSave} data-testid="affiliate-start-confirm">
                {submitting ? t`Signing...` : t`Save & lock code`}
              </PrimaryAction>
              {errorMessage && <StatusText $variant="error">{errorMessage}</StatusText>}
            </Form>
          </BottomMetaRow>
        </>
      )}
    </RewardsCol1Card>
  )
}
