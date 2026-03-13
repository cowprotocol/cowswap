import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ArrowIcon, UI } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useTwapPrototypeProxy } from 'modules/twap'

import { Routes } from 'common/constants/routes'

import { usePrototypeProxySummary } from '../../hooks/usePrototypeProxySummary'
import { AccountDataCard } from '../../pure/AccountDataCard'
import { parameterizeRoute } from '../../utils/parameterizeRoute'
import { AccountCardContainer, LinkStyled, TokenListItemStyled, Title, Wrapper } from '../AccountProxyPage/styled'

interface PrototypeAccountProxyPageProps {
  chainId: SupportedChainId
  proxyAddress: string
}

interface PrototypeAccountProxyPageViewProps {
  chainId: SupportedChainId
  currentTokens: ReturnType<typeof useTwapPrototypeProxy>['currentTokens']
  proxyAddress: string
  totalInProxy: ReturnType<typeof usePrototypeProxySummary>['totalInProxy']
}

interface PrototypeTokenSectionProps {
  currentTokens: ReturnType<typeof useTwapPrototypeProxy>['currentTokens']
  tokensCount: number
  chainId: SupportedChainId
  proxyAddress: string
}

const Description = styled.p`
  margin: 0;
  padding: 0 16px 24px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 15px;
  line-height: 1.45;
`

export function PrototypeAccountProxyPage({ chainId, proxyAddress }: PrototypeAccountProxyPageProps): ReactNode {
  const { activeTokens, claimableTokens, currentTokens } = useTwapPrototypeProxy()
  const { totalInProxy } = usePrototypeProxySummary({
    chainId,
    activeTokens,
    claimableTokens,
  })

  return (
    <PrototypeAccountProxyPageView
      chainId={chainId}
      currentTokens={currentTokens}
      proxyAddress={proxyAddress}
      totalInProxy={totalInProxy}
    />
  )
}

function PrototypeAccountProxyPageView({
  chainId,
  currentTokens,
  proxyAddress,
  totalInProxy,
}: PrototypeAccountProxyPageViewProps): ReactNode {
  const currentTokensCount = currentTokens.length

  return (
    <Wrapper>
      <AccountCardContainer>
        <AccountDataCard
          account={proxyAddress}
          chainId={chainId}
          loading={totalInProxy.isLoading}
          margin="12px auto 18px"
          minHeight={218}
          showWatermark
          totalUsdAmount={totalInProxy.usdAmount}
          valueLabel={t`TWAP proxy value`}
          width="95%"
        />
      </AccountCardContainer>

      <Description>
        <Trans>
          This account holds funds used by your TWAP orders. You can review and withdraw them token by token below.
        </Trans>
      </Description>

      <PrototypeCurrentFundsSection
        chainId={chainId}
        currentTokens={currentTokens}
        proxyAddress={proxyAddress}
        tokensCount={currentTokensCount}
      />
    </Wrapper>
  )
}

function PrototypeCurrentFundsSection({
  chainId,
  currentTokens,
  proxyAddress,
  tokensCount,
}: PrototypeTokenSectionProps): ReactNode {
  return (
    <>
      <Title>
        <Trans>TWAP proxy funds</Trans> · {tokensCount}
      </Title>
      {currentTokens.map((summary) => {
        const balance = BigNumber.from(summary.amount.quotient.toString())

        return (
          <LinkStyled
            key={summary.token.address}
            to={parameterizeRoute(Routes.ACCOUNT_PROXY_RECOVER, {
              chainId,
              proxyAddress,
              tokenAddress: summary.token.address,
            })}
          >
            <TokenListItemStyled token={summary.token} isWalletConnected balance={balance}>
              <ArrowIcon size={16} />
            </TokenListItemStyled>
          </LinkStyled>
        )
      })}
    </>
  )
}
