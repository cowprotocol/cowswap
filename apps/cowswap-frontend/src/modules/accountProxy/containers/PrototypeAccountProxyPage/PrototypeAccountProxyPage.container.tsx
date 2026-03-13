import { ReactNode, useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ArrowIcon, BannerOrientation, InlineBanner, StatusColorVariant, UI } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { addChainIdToRoute } from 'modules/trade'
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
  recoverNoticeActiveOrderCount: number
  totalInProxy: ReturnType<typeof usePrototypeProxySummary>['totalInProxy']
}

interface PrototypeTokenSectionProps {
  currentTokens: ReturnType<typeof useTwapPrototypeProxy>['currentTokens']
  tokensCount: number
  chainId: SupportedChainId
  proxyAddress: string
}

const Description = styled.p`
  && {
    margin: 0 0 24px;
    padding: 16px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    font-size: 15px;
    line-height: 1.45;
  }
`

const NoticeWrapper = styled.div`
  margin: 0 16px 16px;
`

const BannerLink = styled(Link)`
  color: var(${UI.COLOR_TEXT});
  text-decoration: underline;
  text-underline-offset: 2px;
`

export function PrototypeAccountProxyPage({ chainId, proxyAddress }: PrototypeAccountProxyPageProps): ReactNode {
  const { activeTokens, claimableTokens, currentTokens, recoverNoticeActiveOrderCount, dismissRecoverNotice } =
    useTwapPrototypeProxy()
  const { totalInProxy } = usePrototypeProxySummary({
    chainId,
    activeTokens,
    claimableTokens,
  })

  useEffect(() => dismissRecoverNotice, [dismissRecoverNotice])

  return (
    <PrototypeAccountProxyPageView
      chainId={chainId}
      currentTokens={currentTokens}
      proxyAddress={proxyAddress}
      recoverNoticeActiveOrderCount={recoverNoticeActiveOrderCount}
      totalInProxy={totalInProxy}
    />
  )
}

function PrototypeAccountProxyPageView({
  chainId,
  currentTokens,
  proxyAddress,
  recoverNoticeActiveOrderCount,
  totalInProxy,
}: PrototypeAccountProxyPageViewProps): ReactNode {
  const currentTokensCount = currentTokens.length
  const ordersLink = addChainIdToRoute(Routes.ADVANCED_ORDERS, chainId.toString())

  return (
    <Wrapper>
      <AccountCardContainer>
        <AccountDataCard
          account={proxyAddress}
          chainId={chainId}
          loading={totalInProxy.isLoading}
          margin="12px auto 34px"
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

      {recoverNoticeActiveOrderCount > 0 && (
        <NoticeWrapper>
          <InlineBanner bannerType={StatusColorVariant.Alert} orientation={BannerOrientation.Horizontal}>
            <Trans>Funds withdrawn. </Trans>
            <BannerLink to={ordersLink}>
              {recoverNoticeActiveOrderCount === 1 ? (
                <Trans>1 TWAP order</Trans>
              ) : (
                <Trans>{recoverNoticeActiveOrderCount} TWAP orders</Trans>
              )}
            </BannerLink>
            {recoverNoticeActiveOrderCount === 1 ? (
              <Trans> is now unfillable.</Trans>
            ) : (
              <Trans> are now unfillable.</Trans>
            )}
          </InlineBanner>
        </NoticeWrapper>
      )}

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
        <Trans>TWAP proxy funds</Trans> · {tokensCount}{' '}
        {tokensCount === 1 ? <Trans>token</Trans> : <Trans>tokens</Trans>}
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
