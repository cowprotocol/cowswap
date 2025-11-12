import { ReactNode } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { LpToken } from '@cowprotocol/common-const'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { PoolInfoStates } from 'modules/yield/shared'

import { VirtualList } from 'common/pure/VirtualList'

import { useLpTokenRowRenderer } from './rowRenderer'
import {
  CreatePoolLink,
  EmptyList,
  ListHeader,
  NoPoolWrapper,
  Wrapper,
} from './styled'

import type { TokenSelectionHandler } from '../../types'

interface LpTokenListsProps {
  account: string | undefined
  lpTokens: LpToken[]
  balancesState: BalancesState
  displayCreatePoolBanner: boolean
  poolsInfo: PoolInfoStates | undefined
  onSelectToken: TokenSelectionHandler
  openPoolPage(poolAddress: string): void
}

export function LpTokenLists({
  account,
  onSelectToken,
  openPoolPage,
  lpTokens,
  balancesState,
  displayCreatePoolBanner,
  poolsInfo,
}: LpTokenListsProps): ReactNode {
  const { values: balances } = balancesState
  const isMobile = useMediaQuery(Media.upToSmall(false))
  const getItemView = useLpTokenRowRenderer({
    balances,
    poolsInfo,
    openPoolPage,
    onSelectToken,
    isMobile,
    account,
  })

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
