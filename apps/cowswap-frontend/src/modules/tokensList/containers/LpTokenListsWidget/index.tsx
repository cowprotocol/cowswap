import { ReactNode, useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import {
  getTokenSearchFilter,
  LP_TOKEN_LIST_CATEGORIES,
  LP_TOKEN_LIST_COW_AMM_ONLY,
  TokenListCategory,
  useAllLpTokens,
} from '@cowprotocol/tokens'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { usePoolsInfo } from 'modules/yield/shared'

import { TabButton, TabsContainer } from './styled'

import { LpTokenLists } from '../../pure/LpTokenLists'
import { tokensListSorter } from '../../utils/tokensListSorter'

interface LpTokenListsProps<T = TokenListCategory[] | null> {
  account: string | undefined
  children: ReactNode
  search: string
  disableErc20?: boolean
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
    ), value: LP_TOKEN_LIST_COW_AMM_ONLY },
]

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function LpTokenListsWidget({
  account,
  search,
  children,
  onSelectToken,
  openPoolPage,
  tokenListCategoryState,
  disableErc20,
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
        {(disableErc20 ? tabs.slice(1) : tabs).map((tab) => {
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
