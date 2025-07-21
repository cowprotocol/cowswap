import { MouseEventHandler, ReactNode, useCallback } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { TokenLogo } from '@cowprotocol/tokens'
import { LoadingRows, LoadingRowSmall, Media, TokenAmount, TokenName, TokenSymbol } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { VirtualItem } from '@tanstack/react-virtual'
import { Info } from 'react-feather'

import { PoolInfoStates } from 'modules/yield/shared'

import { VirtualList } from 'common/pure/VirtualList'

import {
  CreatePoolLink,
  EmptyList,
  ListHeader,
  ListItem,
  LpTokenBalance,
  LpTokenInfo,
  LpTokenTooltip,
  LpTokenWrapper,
  LpTokenYieldPercentage,
  MobileCard,
  MobileCardLabel,
  MobileCardRow,
  MobileCardValue,
  NoPoolWrapper,
  Wrapper,
} from './styled'

const LoadingElement = (
  <LoadingRows>
    <LoadingRowSmall />
  </LoadingRows>
)

const MobileCardRowItem: React.FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
  <MobileCardRow>
    <MobileCardLabel>{label}:</MobileCardLabel>
    <MobileCardValue>{value}</MobileCardValue>
  </MobileCardRow>
)

interface LpTokenListsProps {
  account: string | undefined
  lpTokens: LpToken[]
  balancesState: BalancesState
  displayCreatePoolBanner: boolean
  poolsInfo: PoolInfoStates | undefined
  onSelectToken(token: TokenWithLogo): void
  openPoolPage(poolAddress: string): void
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function LpTokenLists({
  account,
  onSelectToken,
  openPoolPage,
  lpTokens,
  balancesState,
  displayCreatePoolBanner,
  poolsInfo,
}: LpTokenListsProps) {
  const { values: balances } = balancesState
  const isMobile = useMediaQuery(Media.upToSmall(false))

  const getItemView = useCallback(
    // TODO: Break down this large function into smaller functions
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line max-lines-per-function, complexity
    (lpTokens: LpToken[], item: VirtualItem) => {
      const token = lpTokens[item.index]

      const tokenAddressLower = token.address.toLowerCase()
      const balance = balances ? balances[tokenAddressLower] : undefined
      const balanceAmount = balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined
      const info = poolsInfo?.[tokenAddressLower]?.info

      const onInfoClick: MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation()
        openPoolPage(tokenAddressLower)
      }

      const commonContent = (
        <>
          <TokenLogo token={token} sizeMobile={isMobile ? 24 : 32} />
          <LpTokenInfo>
            <strong>
              <TokenSymbol token={token} />
            </strong>
            <p>
              <TokenName token={token} />
            </p>
          </LpTokenInfo>
        </>
      )

      const BalanceDisplay = balanceAmount ? <TokenAmount amount={balanceAmount} /> : account ? LoadingElement : null

      if (isMobile) {
        return (
          <MobileCard
            key={token.address}
            data-address={token.address}
            data-token-symbol={token.symbol || ''}
            data-token-name={token.name || ''}
            data-element-type="token-selection"
            onClick={() => onSelectToken(token)}
          >
            <MobileCardRow>{commonContent}</MobileCardRow>
            <MobileCardRowItem label="Balance" value={BalanceDisplay} />
            <MobileCardRowItem label="APR" value={info?.apy ? `${info.apy}%` : ''} />
            <MobileCardRowItem
              label="Details"
              value={
                <LpTokenTooltip onClick={onInfoClick}>
                  Pool details
                  <Info size={18} />
                </LpTokenTooltip>
              }
            />
          </MobileCard>
        )
      }

      return (
        <ListItem
          key={token.address}
          data-address={token.address}
          data-token-symbol={token.symbol || ''}
          data-token-name={token.name || ''}
          data-element-type="token-selection"
          onClick={() => onSelectToken(token)}
        >
          <LpTokenWrapper>{commonContent}</LpTokenWrapper>
          <LpTokenBalance>{BalanceDisplay}</LpTokenBalance>
          <LpTokenYieldPercentage>{info?.apy ? `${info.apy}%` : ''}</LpTokenYieldPercentage>
          <LpTokenTooltip onClick={onInfoClick}>
            <Info size={18} />
          </LpTokenTooltip>
        </ListItem>
      )
    },
    [balances, onSelectToken, poolsInfo, openPoolPage, isMobile, account],
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
          <div>Can't find the pool you're looking for?</div>
          <CreatePoolLink href="https://pool-creator.balancer.fi/cow">Create a pool ↗</CreatePoolLink>
        </NoPoolWrapper>
      )}
    </Wrapper>
  )
}
