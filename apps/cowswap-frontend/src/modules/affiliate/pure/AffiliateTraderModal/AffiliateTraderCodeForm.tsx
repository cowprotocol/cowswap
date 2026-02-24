import { type ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary, HelpTooltip, ButtonOutlined, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Edit2 } from 'react-feather'
import styled from 'styled-components/macro'

import { Footer, Body, FormGroup, Label, LabelRow, Title } from './AffiliateTraderModal.shared'
import { CodeLinkingStatusSection } from './CodeLinkingStatusSection'
import { CodeLinkingSubtitle } from './CodeLinkingSubtitle'
import { PayoutConfirmation, type PayoutConfirmationProps } from './PayoutConfirmation'

import { type TraderInfoResponse } from '../../api/bffAffiliateApi.types'
import { type TraderWalletStatus } from '../../hooks/useAffiliateTraderWallet'
import { StatusText } from '../AffiliateBadges.shared'
import { LabelContent } from '../AffiliateMetrics.shared'
import { RefCodeInput, type RefCodeInputProps } from '../RefCodeInput/RefCodeInput'

export interface AffiliateTraderCodeFormProps
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

export function AffiliateTraderCodeForm({
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
}: AffiliateTraderCodeFormProps): ReactNode {
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
          <Label>
            <LabelContent>
              <Trans>Referral code</Trans>
              <HelpTooltip
                text={<Trans>Referral codes contain 5-20 uppercase letters, numbers, dashes, or underscores</Trans>}
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

const LabelAffordances = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const FormActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const FormActionButton = styled(ButtonOutlined)`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(${UI.FONT_SIZE_SMALL});
  padding: 4px 12px;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:enabled {
    opacity: 0.8;
  }
`

const FormActionDanger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(${UI.FONT_SIZE_SMALL});
  font-weight: 600;
  color: var(${UI.COLOR_DANGER_TEXT});
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:enabled {
    opacity: 0.8;
  }
`
