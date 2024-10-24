import { useCallback } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { LpToken } from '@cowprotocol/common-const'
import { TokenLogo, TokensByAddress } from '@cowprotocol/tokens'
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
  LpTokenLogo,
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
  tokensByAddress: TokensByAddress
  balancesState: BalancesState
  displayCreatePoolBanner: boolean
}

export function LpTokenLists({ lpTokens, tokensByAddress, balancesState, displayCreatePoolBanner }: LpTokenListsProps) {
  const { values: balances } = balancesState

  const getItemView = useCallback(
    (lpTokens: LpToken[], item: VirtualItem) => {
      const token = lpTokens[item.index]
      const token0 = token.tokens?.[0]?.toLowerCase()
      const token1 = token.tokens?.[1]?.toLowerCase()
      const balance = balances ? balances[token.address.toLowerCase()] : undefined
      const balanceAmount = balance ? CurrencyAmount.fromRawAmount(token, balance.toHexString()) : undefined

      return (
        <ListItem data-address={token.address}>
          <LpTokenWrapper>
            <LpTokenLogo>
              <div>
                <TokenLogo token={tokensByAddress[token0]} sizeMobile={32} />
              </div>
              <div>
                <TokenLogo token={tokensByAddress[token1]} sizeMobile={32} />
              </div>
            </LpTokenLogo>
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
    [balances, tokensByAddress],
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
