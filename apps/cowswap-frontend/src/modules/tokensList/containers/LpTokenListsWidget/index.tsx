import { ReactNode, useMemo, useState } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import {
  getTokenSearchFilter,
  LP_TOKEN_LIST_CATEGORIES,
  TokenListCategory,
  useAllLpTokens,
  useTokensByAddressMap,
} from '@cowprotocol/tokens'

import { TabButton, TabsContainer } from './styled'

import { LpTokenLists } from '../../pure/LpTokenLists'
import { tokensListSorter } from '../../utils/tokensListSorter'

interface LpTokenListsProps {
  children: ReactNode
  search: string
}

const tabs = [
  { title: 'All', value: null },
  { title: 'Pool tokens', value: LP_TOKEN_LIST_CATEGORIES },
  { title: 'CoW AMM only', value: [TokenListCategory.COW_AMM_LP] },
]

export function LpTokenListsWidget({ search, children }: LpTokenListsProps) {
  const [listsCategories, setListsCategories] = useState<TokenListCategory[] | null>(null)
  const lpTokens = useAllLpTokens(listsCategories)
  const tokensByAddress = useTokensByAddressMap()
  const balancesState = useTokensBalances()

  const balances = balancesState.values

  const sortedTokens = useMemo(() => {
    const filter = getTokenSearchFilter(search)

    return balances ? lpTokens.filter(filter).sort(tokensListSorter(balances)) : lpTokens
  }, [lpTokens, balances, search])

  return (
    <>
      <TabsContainer>
        {tabs.map((tab) => {
          return (
            <TabButton
              key={tab.title}
              active$={tab.value === listsCategories}
              onClick={() => setListsCategories(tab.value)}
            >
              {tab.title}
            </TabButton>
          )
        })}
      </TabsContainer>
      {listsCategories === null ? (
        children
      ) : (
        <LpTokenLists
          displayCreatePoolBanner={listsCategories === tabs[2].value}
          balancesState={balancesState}
          tokensByAddress={tokensByAddress}
          lpTokens={sortedTokens}
        />
      )}
    </>
  )
}
