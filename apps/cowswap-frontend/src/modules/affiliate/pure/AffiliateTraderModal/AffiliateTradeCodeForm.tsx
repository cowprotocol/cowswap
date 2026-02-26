import { type ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary, HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Edit2 } from 'react-feather'

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
import { RefCodeInput, type RefCodeInputProps } from '../RefCodeInput/RefCodeInput'
import { LabelContent, StatusText } from '../shared'

export interface AffiliateTradeCodeFormProps
  extends Omit<PayoutConfirmationProps, 'payoutWallet'>,
    Pick<RefCodeInputProps, 'value' | 'onChange'> {
  walletStatus: TraderWalletStatus
  requiresPayoutConfirmation: boolean
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
  return (
    <FormGroup
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>
          <Trans>Earn while you trade</Trans>
        </Title>
        <CodeLinkingSubtitle codeInfo={codeInfo} />
        <LabelRow>
          <Label htmlFor="referral-code">
            <LabelContent>
              <Trans>Referral code</Trans>
              <HelpTooltip
                text={<Trans>Referral codes contain 5-20 uppercase letters, numbers, dashes, or underscores</Trans>}
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
          hasError={!!error}
          disabled={isLoading || !!savedCode}
          isLoading={isLoading}
          adornmentVariant={isLoading ? 'checking' : error ? 'error' : savedCode ? 'valid' : undefined}
          required
          {...inputProps}
        />
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
        <ButtonPrimary disabled={isLoading} type="submit">
          {submitButtonLabel}
        </ButtonPrimary>
      </Footer>
    </FormGroup>
  )
}
