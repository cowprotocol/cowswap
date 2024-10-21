import { useCallback } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { InfoTooltip, LoadingRows, LoadingRowSmall, TokenAmount, TokenName, TokenSymbol } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { VirtualItem } from '@tanstack/react-virtual'

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
  onSelectToken(token: TokenWithLogo): void
}

export function LpTokenLists({ onSelectToken, lpTokens, balancesState, displayCreatePoolBanner }: LpTokenListsProps) {
  const { values: balances } = balancesState

  const getItemView = useCallback(
    (lpTokens: LpToken[], item: VirtualItem) => {
      const token = lpTokens[item.index]

      const balance = balances ? balances[token.address.toLowerCase()] : undefined
      const balanceAmount = balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined

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
          <span>40%</span>
          <span>
            <InfoTooltip>TODO</InfoTooltip>
          </span>
        </ListItem>
      )
    },
    [balances, onSelectToken],
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
