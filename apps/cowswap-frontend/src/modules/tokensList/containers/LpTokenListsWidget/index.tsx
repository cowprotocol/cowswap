import { ReactNode, useState } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenListCategory, useAllLpTokens, useTokensByAddressMap } from '@cowprotocol/tokens'

import { TabButton, TabsContainer } from './styled'

import { LpTokenLists } from '../../pure/LpTokenLists'

interface LpTokenListsProps {
  children: ReactNode
}

const tabs = [
  { title: 'All', value: null },
  { title: 'Pool tokens', value: [TokenListCategory.LP, TokenListCategory.COW_AMM_LP] },
  { title: 'CoW AMM only', value: [TokenListCategory.COW_AMM_LP] },
]

export function LpTokenListsWidget({ children }: LpTokenListsProps) {
  const [listsCategories, setListsCategories] = useState<TokenListCategory[] | null>(null)
  const lpTokens = useAllLpTokens(listsCategories)
  const tokensByAddress = useTokensByAddressMap()
  const balancesState = useTokensBalances()

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
          lpTokens={lpTokens}
        />
      )}
    </>
  )
}
