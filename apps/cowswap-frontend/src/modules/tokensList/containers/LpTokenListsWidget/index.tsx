import { ReactNode, useState } from 'react'

import { TokenListCategory } from '@cowprotocol/tokens'

import { TabButton, TabsContainer } from './styled'

interface LpTokenListsProps {
  children: ReactNode
}

const tabs = [
  { title: 'All', value: null },
  { title: 'Pool tokens', value: TokenListCategory.LP },
  { title: 'CoW AMM only', value: TokenListCategory.COW_AMM_LP }
]

export function LpTokenListsWidget({ children }: LpTokenListsProps) {
  const [listsCategory, setListsCategory] = useState<TokenListCategory | null>(null)

  return <>
    <TabsContainer>
      {tabs.map(tab => {
        return (<TabButton
                  active$={tab.value === listsCategory}
                  onClick={() => setListsCategory(tab.value)}>{tab.title}</TabButton>)
      })}
    </TabsContainer>
    {listsCategory === null && children}
    {/*TODO*/}
    {listsCategory === TokenListCategory.LP && 'LP'}
    {listsCategory === TokenListCategory.COW_AMM_LP && 'COW_AMM_LP'}
  </>
}
