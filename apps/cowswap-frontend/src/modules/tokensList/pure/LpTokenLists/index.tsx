import { ReactNode } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { LpToken } from '@cowprotocol/common-const'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { PoolInfoStates } from 'modules/yield/shared'

import { VirtualList } from 'common/pure/VirtualList'

import { useLpTokenRowRenderer } from './rowRenderer'
import { CreatePoolLink, EmptyList, ListHeader, NoPoolWrapper, Wrapper } from './styled'

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
              <span>
                <Trans>Pool</Trans>
              </span>
              <span>
                <Trans>Balance</Trans>
              </span>
              <span>APR</span>
              <span></span>
            </ListHeader>
          )}
          <VirtualList items={lpTokens} getItemView={getItemView} />
        </>
      ) : (
        <EmptyList>
          <Trans>No pool tokens available</Trans>
        </EmptyList>
      )}
      {displayCreatePoolBanner && (
        <NoPoolWrapper>
          <div>
            <Trans>Can't find the pool you're looking for?</Trans>
          </div>
          <CreatePoolLink href="https://pool-creator.balancer.fi/cow">
            <Trans>Create a pool</Trans> ↗
          </CreatePoolLink>
        </NoPoolWrapper>
      )}
    </Wrapper>
  )
}
