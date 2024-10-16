import { useCallback } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { LpToken } from '@cowprotocol/common-const'
import { TokenLogo, TokensByAddress } from '@cowprotocol/tokens'
import { InfoTooltip, TokenAmount, TokenName, TokenSymbol } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { VirtualItem } from '@tanstack/react-virtual'

import { VirtualList } from 'common/pure/VirtualList'

import { ListHeader, ListItem, LpTokenInfo, LpTokenLogo, LpTokenWrapper, Wrapper } from './styled'

interface LpTokenListsProps {
  lpTokens: LpToken[]
  tokensByAddress: TokensByAddress
  balancesState: BalancesState
}

export function LpTokenLists({ lpTokens, tokensByAddress, balancesState }: LpTokenListsProps) {
  const { values: balances, isLoading: balancesLoading } = balancesState

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
          <span>
            <TokenAmount amount={balanceAmount} />
          </span>
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
      <VirtualList items={lpTokens} loading={balancesLoading} getItemView={getItemView} />
      <div>
        <div>Can' find?</div>
        <a>Create a pool</a>
      </div>
    </Wrapper>
  )
}
