import { type FormEvent, type ReactNode, useId } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary, HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Edit2 } from 'react-feather'

import { REF_CODE_MIN_LENGTH } from 'modules/affiliate'

import { CodeLinkingStatusSection } from './CodeLinkingStatusSection'
import { CodeLinkingSubtitle } from './CodeLinkingSubtitle'
import { PayoutConfirmation, type PayoutConfirmationProps } from './PayoutConfirmation'
import {
  Body,
  Footer,
  FormActionButton,
  FormActionDanger,
  FormActions,
  FormGroup,
  Label,
  LabelAffordances,
  LabelRow,
  Title,
} from './styles'

import { type TraderInfoResponse } from '../../api/bffAffiliateApi.types'
import { type TraderWalletStatus } from '../../hooks/useAffiliateTraderWallet'
import { formatRefCode } from '../../lib/affiliateProgramUtils'
import { RefCodeInput, type RefCodeInputProps } from '../RefCodeInput/RefCodeInput'
import { LabelContent, StatusText } from '../shared'

export interface AffiliateTradeCodeFormProps
  extends Omit<PayoutConfirmationProps, 'payoutWallet'>,
    Pick<RefCodeInputProps, 'value' | 'onChange'> {
  walletStatus: TraderWalletStatus
  requiresPayoutConfirmation: boolean
  showInvalidFormat: boolean
  codeInfo?: TraderInfoResponse | null
  savedCode?: string
  isLoading: boolean
  error?: string
  onEdit(): void
  onRemove(): void
  submitButtonLabel: string
  onSubmit(): void
}

export function AffiliateTradeCodeForm({
  walletStatus,
  account,
  requiresPayoutConfirmation,
  showInvalidFormat,
  codeInfo,
  payoutConfirmed,
  onTogglePayoutConfirmed,
  savedCode,
  isLoading,
  error,
  onEdit,
  onRemove,
  submitButtonLabel,
  onSubmit,
  ...inputProps
}: AffiliateTradeCodeFormProps): ReactNode {
  const referralCodeInputId = useId()
  const hasError = showInvalidFormat || !!error
  const canSubmit =
    !account ||
    (!isLoading && (!requiresPayoutConfirmation || payoutConfirmed) && !!formatRefCode(String(inputProps.value)))

  return (
    <FormGroup
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (canSubmit) onSubmit()
      }}
    >
      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>
          <Trans>Earn while you trade</Trans>
        </Title>
        <CodeLinkingSubtitle codeInfo={codeInfo} />
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
          <LabelAffordances>
            {!!savedCode && (
              <FormActions>
                <FormActionDanger type="button" onClick={onRemove}>
                  <Trans>Remove</Trans>
                </FormActionDanger>
                <FormActionButton type="button" onClick={onEdit} aria-label={t`Edit code`}>
                  <Edit2 size={14} />
                  <Trans>Edit</Trans>
                </FormActionButton>
              </FormActions>
            )}
          </LabelAffordances>
        </LabelRow>
        <RefCodeInput
          id={referralCodeInputId}
          hasError={hasError}
          disabled={isLoading || !!savedCode}
          isLoading={isLoading}
          adornmentVariant={hasError ? 'error' : isLoading ? 'checking' : savedCode ? 'valid' : undefined}
          {...inputProps}
        />
        {showInvalidFormat && (
          <StatusText $variant="error">
            {typeof inputProps.value === 'string' && inputProps.value.length < REF_CODE_MIN_LENGTH ? (
              <Trans>The code must be at least {REF_CODE_MIN_LENGTH} characters long.</Trans>
            ) : (
              <Trans>Only A-Z, 0-9, dashes, and underscores are allowed.</Trans>
            )}
          </StatusText>
        )}
        {error && <StatusText $variant="error">{error}</StatusText>}
        <CodeLinkingStatusSection walletStatus={walletStatus} codeInfo={codeInfo} />
        {requiresPayoutConfirmation && (
          <PayoutConfirmation
            account={account}
            payoutConfirmed={payoutConfirmed}
            onTogglePayoutConfirmed={onTogglePayoutConfirmed}
          />
        )}
      </Body>
      <Footer>
        <ButtonPrimary disabled={!canSubmit} type="submit">
          {submitButtonLabel}
        </ButtonPrimary>
      </Footer>
    </FormGroup>
  )
}
