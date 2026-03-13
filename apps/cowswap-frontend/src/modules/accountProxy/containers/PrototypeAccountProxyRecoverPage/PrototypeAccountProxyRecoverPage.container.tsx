import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { BannerOrientation, ButtonSecondary, ButtonSize, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'

import * as styledEl from '../AccountProxyRecoverPage/styled'

interface PrototypeAccountProxyRecoverPageProps {
  activeOrderCount: number
  amount: CurrencyAmount<Currency> | undefined
  canWithdraw: boolean
  ordersLink: string
  onRecover(): void
  onGoBack(): void
}

export function PrototypeAccountProxyRecoverPage({
  activeOrderCount,
  amount,
  canWithdraw,
  ordersLink,
  onRecover,
  onGoBack,
}: PrototypeAccountProxyRecoverPageProps): ReactNode {
  return (
    <styledEl.Wrapper>
      {activeOrderCount > 0 ? (
        <InlineBanner bannerType={StatusColorVariant.Alert} orientation={BannerOrientation.Horizontal}>
          {activeOrderCount === 1 ? (
            <>
              <Trans>Currently </Trans>
              <styledEl.BannerLink as={Link} to={ordersLink}>
                <Trans>1 TWAP order</Trans>
              </styledEl.BannerLink>
              <Trans> depends on these funds. Withdrawing them will make that order unfillable.</Trans>
            </>
          ) : (
            <>
              <Trans>Currently </Trans>
              <styledEl.BannerLink as={Link} to={ordersLink}>
                <Trans>{activeOrderCount} TWAP orders</Trans>
              </styledEl.BannerLink>
              <Trans> depend on these funds. Withdrawing them will make those orders unfillable.</Trans>
            </>
          )}
        </InlineBanner>
      ) : null}
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
        <styledEl.ButtonPrimaryStyled buttonSize={ButtonSize.BIG} onClick={onRecover}>
          {t`Withdraw funds`}
        </styledEl.ButtonPrimaryStyled>
      ) : (
        <ButtonSecondary buttonSize={ButtonSize.BIG} onClick={onGoBack}>
          <Trans>Back to TWAP proxy account</Trans>
        </ButtonSecondary>
      )}
    </styledEl.Wrapper>
  )
}
