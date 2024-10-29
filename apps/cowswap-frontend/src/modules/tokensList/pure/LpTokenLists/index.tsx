import { useCallback } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { LpToken } from '@cowprotocol/common-const'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { TokenLogo, TokensByAddress } from '@cowprotocol/tokens'
import { InfoTooltip, LoadingRows, LoadingRowSmall, TokenAmount, TokenName, TokenSymbol } from '@cowprotocol/ui'
import { Media } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { VirtualItem } from '@tanstack/react-virtual'

import { VirtualList } from 'common/pure/VirtualList'

import {
  CreatePoolLink,
  ListHeader,
  ListItem,
  LpTokenInfo,
  LpTokenLogo,
  LpTokenWrapper,
  LpTokenYieldPercentage,
  LpTokenBalance,
  LpTokenTooltip,
  NoPoolWrapper,
  Wrapper,
  EmptyList,
  MobileCard,
  MobileCardRow,
  MobileCardLabel,
  MobileCardValue,
} from './styled'

const LoadingElement = (
  <LoadingRows>
    <LoadingRowSmall />
  </LoadingRows>
)

const MobileCardRowItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <MobileCardRow>
    <MobileCardLabel>{label}:</MobileCardLabel>
    <MobileCardValue>{value}</MobileCardValue>
  </MobileCardRow>
)

const TokenInfo: React.FC<{ token: LpToken }> = ({ token }) => (
  <>
    <strong>
      <TokenSymbol token={token} />
    </strong>
    <p>
      <TokenName token={token} />
    </p>
  </>
)

const LpTokenLogos: React.FC<{ token0: string; token1: string; tokensByAddress: TokensByAddress; size: number }> = ({
  token0,
  token1,
  tokensByAddress,
  size,
}) => (
  <LpTokenLogo>
    <TokenLogo token={tokensByAddress[token0]} sizeMobile={size} />
    <TokenLogo token={tokensByAddress[token1]} sizeMobile={size} />
  </LpTokenLogo>
)

interface LpTokenListsProps {
  lpTokens: LpToken[]
  tokensByAddress: TokensByAddress
  balancesState: BalancesState
  displayCreatePoolBanner: boolean
}

export function LpTokenLists({ lpTokens, tokensByAddress, balancesState, displayCreatePoolBanner }: LpTokenListsProps) {
  const { values: balances } = balancesState
  const isMobile = useMediaQuery(Media.upToSmall(false))

  const getItemView = useCallback(
    (lpTokens: LpToken[], item: VirtualItem) => {
      const token = lpTokens[item.index]
      const token0 = token.tokens?.[0]?.toLowerCase()
      const token1 = token.tokens?.[1]?.toLowerCase()
      const balance = balances ? balances[token.address.toLowerCase()] : undefined
      const balanceAmount = balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined

      const commonContent = (
        <>
          <LpTokenLogos token0={token0} token1={token1} tokensByAddress={tokensByAddress} size={isMobile ? 24 : 32} />
          <LpTokenInfo>
            <TokenInfo token={token} />
          </LpTokenInfo>
        </>
      )

      if (isMobile) {
        return (
          <MobileCard key={token.address}>
            <MobileCardRow>{commonContent}</MobileCardRow>
            <MobileCardRowItem
              label="Balance"
              value={balanceAmount ? <TokenAmount amount={balanceAmount} /> : LoadingElement}
            />
            <MobileCardRowItem label="APR" value="40%" />
            <MobileCardRowItem
              label="Details"
              value={
                <LpTokenTooltip>
                  <InfoTooltip preText="Pool details" size={18}>
                    TODO
                  </InfoTooltip>
                </LpTokenTooltip>
              }
            />
          </MobileCard>
        )
      }

      return (
        <ListItem data-address={token.address}>
          <LpTokenWrapper>{commonContent}</LpTokenWrapper>
          <LpTokenBalance>{balanceAmount ? <TokenAmount amount={balanceAmount} /> : LoadingElement}</LpTokenBalance>
          <LpTokenYieldPercentage>40%</LpTokenYieldPercentage>
          <LpTokenTooltip>
            <InfoTooltip size={18}>TODO</InfoTooltip>
          </LpTokenTooltip>
        </ListItem>
      )
    },
    [balances, tokensByAddress, isMobile],
  )

  return (
    <Wrapper>
      {lpTokens.length > 0 ? (
        <>
          {!isMobile && (
            <ListHeader>
              <span>Pool</span>
              <span>Balance</span>
              <span>APR</span>
              <span></span>
            </ListHeader>
          )}
          <VirtualList items={lpTokens} getItemView={getItemView} />
        </>
      ) : (
        <EmptyList>No pool tokens available</EmptyList>
      )}
      {displayCreatePoolBanner && (
        <NoPoolWrapper>
          <div>Can’t find the pool you’re looking for?</div>
          <CreatePoolLink href="https://pool-creator.balancer.fi/cow">Create a pool ↗</CreatePoolLink>
        </NoPoolWrapper>
      )}
    </Wrapper>
  )
}
