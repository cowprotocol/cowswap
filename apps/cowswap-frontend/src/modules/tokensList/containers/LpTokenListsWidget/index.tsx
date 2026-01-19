import { ReactNode, useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import {
  getTokenSearchFilter,
  LP_TOKEN_LIST_CATEGORIES,
  LP_TOKEN_LIST_COW_AMM_ONLY,
  TokenListCategory,
  useAllLpTokens,
} from '@cowprotocol/tokens'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { usePoolsInfo } from 'modules/yield/shared'

import { TabButton, TabsContainer } from './styled'

import { LpTokenLists } from '../../pure/LpTokenLists'
import { tokensListSorter } from '../../utils/tokensListSorter'

interface LpTokenListsProps<T = TokenListCategory[] | null> {
  account: string | undefined
  children: ReactNode
  search: string
  disableErc20?: boolean
  openPoolPage(poolAddress: string): void
  tokenListCategoryState: [T, (category: T) => void]
}

const getTabs = (): { id: string; title: string | ReactNode; value: null | TokenListCategory[] }[] => [
  { id: 'all', title: t`All`, value: null },
  { id: 'pool', title: t`Pool tokens`, value: LP_TOKEN_LIST_CATEGORIES },
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
        <Trans>CoW AMM only</Trans>
      </>
    ),
    value: LP_TOKEN_LIST_COW_AMM_ONLY,
  },
]

export function LpTokenListsWidget({
  account,
  search,
  children,
  openPoolPage,
  tokenListCategoryState,
  disableErc20,
}: LpTokenListsProps): ReactNode {
  const tabs = getTabs()
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
          openPoolPage={openPoolPage}
          poolsInfo={poolsInfo}
        />
      )}
    </>
  )
}
