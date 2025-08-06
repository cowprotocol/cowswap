import { ReactNode } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ChevronRight } from 'react-feather'
import { useParams } from 'react-router'

import { Routes } from 'common/constants/routes'

import { ChevronWrapper, LinkStyled, Title, TokenListItemStyled, Wrapper } from './styled'

import { useRefundAmounts } from '../../hooks/useRefundAmounts'
import { useSetupBalancesContext } from '../../hooks/useSetupBalancesContext'
import { useTokensToRefund } from '../../hooks/useTokensToRefund'
import { AccountCard } from '../../pure/AccountCard'
import { parameterizeRoute } from '../../utils/parameterizeRoute'
import { sumUpUsdAmounts } from '../../utils/sumUpUsdAmounts'

export function AccountProxyPage(): ReactNode {
  const { chainId } = useWalletInfo()
  const { proxyAddress } = useParams()

  // Switch BalancesUpdater context to the current proxy
  useSetupBalancesContext(proxyAddress)

  const tokensToRefund = useTokensToRefund()
  const refundAmounts = useRefundAmounts()
  const balances = useTokensBalances()

  const refundValues = refundAmounts ? Object.values(refundAmounts) : null

  const isSomeTokenLoading = !!refundValues?.length ? refundValues.some((t) => t.isLoading) : balances.isLoading

  const totalUsdAmount = refundAmounts ? sumUpUsdAmounts(chainId, refundAmounts) : null

  if (!proxyAddress) return null

  return (
    <Wrapper>
      <AccountCard
        chainId={chainId}
        account={proxyAddress}
        totalUsdAmount={totalUsdAmount}
        loading={isSomeTokenLoading}
      />
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
                <ChevronWrapper>
                  <ChevronRight size={24} />
                </ChevronWrapper>
              </TokenListItemStyled>
            </LinkStyled>
          )
        })}
    </Wrapper>
  )
}
