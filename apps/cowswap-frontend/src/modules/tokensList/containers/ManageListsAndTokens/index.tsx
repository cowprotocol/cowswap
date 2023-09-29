import { useState } from 'react'

import { ArrowLeft, X } from 'react-feather'

import * as styledEl from './styled'

import { TokenWithLogo } from '../../types'
import { ManageLists, TokenList } from '../ManageLists'
import { ManageTokens } from '../ManageTokens'

export interface ManageListsAndTokensProps {
  lists: TokenList[]
  customTokens: TokenWithLogo[]
}

export function ManageListsAndTokens(props: ManageListsAndTokensProps) {
  const { lists, customTokens } = props

  const [currentTab, setCurrentTab] = useState<'tokens' | 'lists'>('lists')

  return (
    <div>
      <div>
        <div>
          <ArrowLeft />
        </div>
        <div>Manage</div>
        <div>
          <X />
        </div>
      </div>
      <div>
        <styledEl.Tab active$={currentTab === 'lists'} onClick={() => setCurrentTab('lists')}>
          Lists
        </styledEl.Tab>
        <styledEl.Tab active$={currentTab === 'tokens'} onClick={() => setCurrentTab('tokens')}>
          Tokens
        </styledEl.Tab>
      </div>
      {currentTab === 'lists' ? <ManageLists lists={lists} /> : <ManageTokens tokens={customTokens} />}
    </div>
  )
}
