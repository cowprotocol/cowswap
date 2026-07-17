import { ReactNode } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { isAddress } from '@cowprotocol/common-utils'
import { ArrowIcon } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useParams } from 'react-router'

import { Routes } from 'common/constants/routes'

import * as styledEl from './AccountProxyPage.styled'

import { useRefundAmounts } from '../../hooks/useRefundAmounts'
import { useTokensToRefund } from '../../hooks/useTokensToRefund'
import { AccountDataCard } from '../../pure/AccountDataCard/AccountDataCard.pure'
import { BaseAccountCard } from '../../pure/BaseAccountCard/BaseAccountCard.pure'
import { parameterizeRoute } from '../../utils/parameterizeRoute'
import { sumUpUsdAmounts } from '../../utils/sumUpUsdAmounts'

export function AccountProxyPage(): ReactNode {
  const { chainId } = useWalletInfo()
  const { proxyAddress } = useParams()

  const tokensToRefund = useTokensToRefund()
  const refundAmounts = useRefundAmounts()
  const balances = useTokensBalances()

  const refundValues = refundAmounts ? Object.values(refundAmounts) : null

  const isSomeTokenLoading = !!refundValues?.length ? refundValues.some((t) => t.isLoading) : balances.isLoading

  const totalUsdAmount = refundAmounts ? sumUpUsdAmounts(chainId, refundAmounts) : null

  if (!proxyAddress) return null

  // Validate proxy address early
  if (!isAddress(proxyAddress)) {
    return (
      <styledEl.Wrapper>
        <styledEl.AccountCardContainer>
          <BaseAccountCard width="95%" margin="12px auto 34px" minHeight={218} ariaLabel={t`Invalid proxy address`}>
            <styledEl.ErrorMessage>
              <Trans>Invalid proxy address</Trans>
            </styledEl.ErrorMessage>
          </BaseAccountCard>
        </styledEl.AccountCardContainer>
      </styledEl.Wrapper>
    )
  }

  return (
    <styledEl.Wrapper>
      <styledEl.AccountCardContainer>
        <AccountDataCard
          chainId={chainId}
          account={proxyAddress}
          totalUsdAmount={totalUsdAmount}
          loading={isSomeTokenLoading}
          width="95%"
          margin="12px auto 34px"
          minHeight={218}
          showWatermark
        />
      </styledEl.AccountCardContainer>
      <styledEl.Title>
        <Trans>Recoverable tokens</Trans> · {tokensToRefund?.length || 0}
      </styledEl.Title>
      {refundValues &&
        refundValues.map(({ token, balance, usdAmount }) => {
          return (
            <styledEl.LinkStyled
              key={token.address}
              to={parameterizeRoute(Routes.ACCOUNT_PROXY_RECOVER, {
                chainId,
                proxyAddress,
                tokenAddress: token.address,
              })}
            >
              <styledEl.TokenListItemStyled token={token} isWalletConnected balance={balance} usdAmount={usdAmount}>
                <ArrowIcon verticalCenter />
              </styledEl.TokenListItemStyled>
            </styledEl.LinkStyled>
          )
        })}
    </styledEl.Wrapper>
  )
}
