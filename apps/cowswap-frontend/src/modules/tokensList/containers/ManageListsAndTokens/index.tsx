import { useState } from 'react'

import { ArrowLeft, X } from 'react-feather'

import * as styledEl from './styled'

import { IconButton } from '../../pure/commonElements'
import { TokenList } from '../../pure/TokenListItem'
import { TokenWithLogo } from '../../types'
import { ManageLists } from '../ManageLists'
import { ManageTokens } from '../ManageTokens'

export interface ManageListsAndTokensProps {
  lists: TokenList[]
  customTokens: TokenWithLogo[]
}

export function ManageListsAndTokens(props: ManageListsAndTokensProps) {
  const { lists, customTokens } = props

  const [currentTab, setCurrentTab] = useState<'tokens' | 'lists'>('lists')

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <div>
          <IconButton>
            <ArrowLeft />
          </IconButton>
        </div>
        <div>Manage</div>
        <div>
          <IconButton>
            <X />
          </IconButton>
        </div>
      </styledEl.Header>
      <styledEl.TabsContainer>
        <styledEl.Tab active$={currentTab === 'lists'} onClick={() => setCurrentTab('lists')}>
          Lists
        </styledEl.Tab>
        <styledEl.Tab active$={currentTab === 'tokens'} onClick={() => setCurrentTab('tokens')}>
          Tokens
        </styledEl.Tab>
      </styledEl.TabsContainer>
      {currentTab === 'lists' ? <ManageLists lists={lists} /> : <ManageTokens tokens={customTokens} />}
    </styledEl.Wrapper>
  )
}
