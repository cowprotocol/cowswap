import { MouseEventHandler, useCallback } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { LoadingRows, LoadingRowSmall, TokenAmount, TokenName, TokenSymbol } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { VirtualItem } from '@tanstack/react-virtual'
import { Info } from 'react-feather'

import { PoolInfoStates } from 'modules/yield/shared'

import { VirtualList } from 'common/pure/VirtualList'

import {
  ArrowUpRight,
  CreatePoolLink,
  ListHeader,
  ListItem,
  LpTokenInfo,
  LpTokenWrapper,
  NoPoolWrapper,
  Wrapper,
} from './styled'

const LoadingElement = (
  <LoadingRows>
    <LoadingRowSmall />
  </LoadingRows>
)

interface LpTokenListsProps {
  lpTokens: LpToken[]
  balancesState: BalancesState
  displayCreatePoolBanner: boolean
  poolsInfo: PoolInfoStates | undefined
  onSelectToken(token: TokenWithLogo): void
  openPoolPage(poolAddress: string): void
}

export function LpTokenLists({
  onSelectToken,
  openPoolPage,
  lpTokens,
  balancesState,
  displayCreatePoolBanner,
  poolsInfo,
}: LpTokenListsProps) {
  const { values: balances } = balancesState

  const getItemView = useCallback(
    (lpTokens: LpToken[], item: VirtualItem) => {
      const token = lpTokens[item.index]

      const tokenAddressLower = token.address.toLowerCase()
      const balance = balances ? balances[tokenAddressLower] : undefined
      const balanceAmount = balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined
      const info = poolsInfo?.[tokenAddressLower]?.info

      const onInfoClick: MouseEventHandler<SVGElement> = (e) => {
        e.stopPropagation()
        openPoolPage(tokenAddressLower)
      }

      return (
        <ListItem data-address={token.address} onClick={() => onSelectToken(token)}>
          <LpTokenWrapper>
            <TokenLogo token={token} sizeMobile={32} />
            <LpTokenInfo>
              <strong>
                <TokenSymbol token={token} />
              </strong>
              <p>
                <TokenName token={token} />
              </p>
            </LpTokenInfo>
          </LpTokenWrapper>
          <span>{balanceAmount ? <TokenAmount amount={balanceAmount} /> : LoadingElement}</span>
          <span>{info?.apy ? `${info.apy}%` : '-'}</span>
          <span>
            <Info onClick={onInfoClick} size={16} />
          </span>
        </ListItem>
      )
    },
    [balances, onSelectToken, poolsInfo, openPoolPage],
  )

  return (
    <Wrapper>
      <ListHeader>
        <span>Pool</span>
        <span>Balance</span>
        <span>APR</span>
        <span></span>
      </ListHeader>
      <VirtualList items={lpTokens} getItemView={getItemView} />
      {displayCreatePoolBanner && (
        <NoPoolWrapper>
          <div>Can’t find the pool you’re looking for?</div>
          <CreatePoolLink
            href="https://balancer.fi/pools/cow?utm_source=swap.cow.fi&utm_medium=web&utm_content=yield-token-selector"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create a pool
            <ArrowUpRight size={16} />
          </CreatePoolLink>
        </NoPoolWrapper>
      )}
    </Wrapper>
  )
}
