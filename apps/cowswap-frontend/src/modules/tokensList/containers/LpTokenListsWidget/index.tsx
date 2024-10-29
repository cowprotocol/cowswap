import { ReactNode, useState } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenListCategory, useAllLpTokens, useTokensByAddressMap } from '@cowprotocol/tokens'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { TabButton, TabsContainer } from './styled'

import { LpTokenLists } from '../../pure/LpTokenLists'

interface LpTokenListsProps {
  children: ReactNode
}

const tabs = [
  { id: 'all', title: 'All', value: null },
  { id: 'pool', title: 'Pool tokens', value: [TokenListCategory.LP, TokenListCategory.COW_AMM_LP] },
  {
    id: 'cow-amm',
    title: (
      <>
        <ProductLogo
          variant={ProductVariant.CowAmm}
          height={12}
          overrideColor={UI.COLOR_TEXT_OPACITY_60}
          theme="dark"
          logoIconOnly
        />{' '}
        CoW AMM only
      </>
    ),
    value: [TokenListCategory.COW_AMM_LP],
  },
]

export function LpTokenListsWidget({ children }: LpTokenListsProps) {
  const [listsCategories, setListsCategories] = useState<TokenListCategory[] | null>(null)
  const lpTokens = useAllLpTokens(listsCategories)
  const tokensByAddress = useTokensByAddressMap()
  const balancesState = useTokensBalances()

  return (
    <>
      <TabsContainer>
        {tabs.map((tab) => (
          <TabButton key={tab.id} active$={tab.value === listsCategories} onClick={() => setListsCategories(tab.value)}>
            {tab.title}
          </TabButton>
        ))}
      </TabsContainer>
      {listsCategories === null ? (
        children
      ) : lpTokens.length === 0 ? (
        <LpTokenLists
          displayCreatePoolBanner={listsCategories === tabs[2].value}
          balancesState={balancesState}
          tokensByAddress={tokensByAddress}
          lpTokens={[]}
        />
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
