import { ReactNode } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { isAddress } from '@cowprotocol/common-utils'
import { ArrowIcon } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useParams } from 'react-router'

import { Routes } from 'common/constants/routes'

import { AccountCardContainer, ErrorMessage, LinkStyled, Title, TokenListItemStyled, Wrapper } from './styled'

import { useRefundAmounts } from '../../hooks/useRefundAmounts'
import { useTokensToRefund } from '../../hooks/useTokensToRefund'
import { AccountDataCard } from '../../pure/AccountDataCard'
import { BaseAccountCard } from '../../pure/BaseAccountCard'
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
      <Wrapper>
        <AccountCardContainer>
          <BaseAccountCard width="95%" margin="12px auto 34px" minHeight={218} ariaLabel={t`Invalid proxy address`}>
            <ErrorMessage>
              <Trans>Invalid proxy address</Trans>
            </ErrorMessage>
          </BaseAccountCard>
        </AccountCardContainer>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <AccountCardContainer>
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
      </AccountCardContainer>
      <Title>
        <Trans>Recoverable tokens</Trans> · {tokensToRefund?.length || 0}
      </Title>
      {refundValues &&
        refundValues.map(({ token, balance, usdAmount }) => {
          return (
            <LinkStyled
              key={token.address}
              to={parameterizeRoute(Routes.ACCOUNT_PROXY_RECOVER, {
                chainId,
                proxyAddress,
                tokenAddress: token.address,
              })}
            >
              <TokenListItemStyled token={token} isWalletConnected balance={balance} usdAmount={usdAmount}>
                <ArrowIcon verticalCenter />
              </TokenListItemStyled>
            </LinkStyled>
          )
        })}
    </Wrapper>
  )
}
