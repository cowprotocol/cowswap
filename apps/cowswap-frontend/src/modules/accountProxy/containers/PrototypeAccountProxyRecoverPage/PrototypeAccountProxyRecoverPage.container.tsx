import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenLogo } from '@cowprotocol/tokens'
import {
  BannerOrientation,
  ButtonSecondary,
  ButtonSize,
  CenteredDots,
  InlineBanner,
  Loader,
  StatusColorVariant,
} from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { RecoverSigningStep } from '../../hooks/useRecoverFundsFromProxy'
import * as styledEl from '../AccountProxyRecoverPage/styled'

interface ActiveOrdersBannerProps {
  activeOrderCount: number
  ordersLink: string
}

interface PrototypeAccountProxyRecoverPageProps {
  activeOrderCount: number
  amount: CurrencyAmount<Currency> | undefined
  canWithdraw: boolean
  ordersLink: string
  onRecover(): void
  onGoBack(): void
  txInProgress: boolean
  txSigningStep: RecoverSigningStep | null
}

export function PrototypeAccountProxyRecoverPage({
  activeOrderCount,
  amount,
  canWithdraw,
  ordersLink,
  onRecover,
  onGoBack,
  txInProgress,
  txSigningStep,
}: PrototypeAccountProxyRecoverPageProps): ReactNode {
  return (
    <styledEl.Wrapper>
      {activeOrderCount > 0 ? <ActiveOrdersBanner activeOrderCount={activeOrderCount} ordersLink={ordersLink} /> : null}
      <styledEl.TokenWrapper>
        <span>
          <Trans>TWAP proxy balance</Trans>
        </span>
        <styledEl.BalanceWrapper>
          {amount ? (
            <>
              <styledEl.TokenAmountStyled amount={amount} />
              <styledEl.TokenLogoWrapper>
                <TokenLogo token={amount.currency} size={24} />
                {amount.currency.symbol}
              </styledEl.TokenLogoWrapper>
            </>
          ) : (
            <styledEl.ErrorText>
              <Trans>Token not found in this TWAP proxy account.</Trans>
            </styledEl.ErrorText>
          )}
        </styledEl.BalanceWrapper>
      </styledEl.TokenWrapper>

      {canWithdraw ? (
        <styledEl.ButtonPrimaryStyled
          buttonSize={ButtonSize.BIG}
          disabled={!amount || !!txSigningStep || txInProgress}
          onClick={onRecover}
        >
          {txInProgress && <Loader />}
          {txSigningStep && !txInProgress && (
            <>
              {txSigningStep === RecoverSigningStep.SIGN_RECOVER_FUNDS && t`1/2 Confirm withdrawal`}
              {txSigningStep === RecoverSigningStep.SIGN_TRANSACTION && t`2/2 Sign transaction`}
              <CenteredDots smaller />
            </>
          )}
          {!txSigningStep && !txInProgress && t`Withdraw funds`}
        </styledEl.ButtonPrimaryStyled>
      ) : (
        <ButtonSecondary buttonSize={ButtonSize.BIG} onClick={onGoBack}>
          <Trans>Back to TWAP proxy account</Trans>
        </ButtonSecondary>
      )}
    </styledEl.Wrapper>
  )
}

function ActiveOrdersBanner({ activeOrderCount, ordersLink }: ActiveOrdersBannerProps): ReactNode {
  return (
    <InlineBanner bannerType={StatusColorVariant.Alert} orientation={BannerOrientation.Horizontal} noWrapContent>
      {activeOrderCount === 1 ? (
        <styledEl.BannerText>
          <Trans>Currently </Trans>
          <styledEl.BannerLink to={ordersLink}>
            <Trans>1 TWAP order</Trans>
          </styledEl.BannerLink>
          <Trans> depends on these funds. Withdrawing them will make that order unfillable.</Trans>
        </styledEl.BannerText>
      ) : (
        <styledEl.BannerText>
          <Trans>Currently </Trans>
          <styledEl.BannerLink to={ordersLink}>
            <Trans>{activeOrderCount} TWAP orders</Trans>
          </styledEl.BannerLink>
          <Trans> depend on these funds. Withdrawing them will make those orders unfillable.</Trans>
        </styledEl.BannerText>
      )}
    </InlineBanner>
  )
}
