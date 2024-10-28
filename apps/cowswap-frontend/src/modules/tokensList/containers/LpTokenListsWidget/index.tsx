import { ReactNode, useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenSearchFilter, LP_TOKEN_LIST_CATEGORIES, TokenListCategory, useAllLpTokens } from '@cowprotocol/tokens'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { usePoolsInfo } from 'modules/yield/shared'

import { TabButton, TabsContainer } from './styled'

import { LpTokenLists } from '../../pure/LpTokenLists'
import { tokensListSorter } from '../../utils/tokensListSorter'

interface LpTokenListsProps<T = TokenListCategory[] | null> {
  account: string | undefined
  children: ReactNode
  search: string
  onSelectToken(token: TokenWithLogo): void
  openPoolPage(poolAddress: string): void
  tokenListCategoryState: [T, (category: T) => void]
}

const tabs = [
  { id: 'all', title: 'All', value: null },
  { id: 'pool', title: 'Pool tokens', value: LP_TOKEN_LIST_CATEGORIES },
  { id: 'cow-amm', title: (
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
    ), value: [TokenListCategory.COW_AMM_LP] },
]

export function LpTokenListsWidget({
  account,
  search,
  children,
  onSelectToken,
  openPoolPage,
  tokenListCategoryState,
}: LpTokenListsProps) {
  const [listsCategories, setListsCategories] = tokenListCategoryState
  const lpTokens = useAllLpTokens(listsCategories)
  const balancesState = useTokensBalances()
  const poolsInfo = usePoolsInfo()

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
              key={tab.id}
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
          account={account}
          displayCreatePoolBanner={listsCategories === tabs[2].value}
          balancesState={balancesState}
          lpTokens={sortedTokens}
          onSelectToken={onSelectToken}
          openPoolPage={openPoolPage}
          poolsInfo={poolsInfo}
        />
      )}
    </>
  )
}
