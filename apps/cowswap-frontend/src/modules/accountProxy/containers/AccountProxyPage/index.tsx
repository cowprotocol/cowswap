import { ReactNode } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { isAddress } from '@cowprotocol/common-utils'
import { ArrowIcon } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useParams } from 'react-router'

import { Routes } from 'common/constants/routes'

import { AccountCardContainer, ErrorMessage, LinkStyled, Title, TokenListItemStyled, Wrapper } from './styled'

import { useRefundAmounts } from '../../hooks/useRefundAmounts'
import { useTokensToRefund } from '../../hooks/useTokensToRefund'
import { AccountCard } from '../../pure/AccountCard'
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
          <AccountCard
            chainId={chainId}
            account={proxyAddress}
            width="95%"
            margin="12px auto 34px"
            minHeight={218}
            ariaLabel="Invalid proxy address"
          >
            <ErrorMessage>Invalid proxy address</ErrorMessage>
          </AccountCard>
        </AccountCardContainer>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <AccountCardContainer>
        <AccountCard
          chainId={chainId}
          account={proxyAddress}
          totalUsdAmount={totalUsdAmount}
          loading={isSomeTokenLoading}
          width="95%"
          margin="12px auto 34px"
          minHeight={218}
          enableScale
          showWatermark
        />
      </AccountCardContainer>
      <Title>Recoverable tokens · {tokensToRefund?.length || 0}</Title>
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
