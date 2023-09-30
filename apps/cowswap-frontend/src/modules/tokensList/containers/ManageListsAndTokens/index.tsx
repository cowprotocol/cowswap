import { useState } from 'react'

import * as styledEl from './styled'

import { ModalHeader } from '../../pure/ModalHeader'
import { TokenList, TokenWithLogo } from '../../types'
import { ManageLists } from '../ManageLists'
import { ManageTokens } from '../ManageTokens'

export interface ManageListsAndTokensProps {
  lists: TokenList[]
  customTokens: TokenWithLogo[]
}

export function ManageListsAndTokens(props: ManageListsAndTokensProps) {
  const { lists, customTokens } = props

  const [currentTab, setCurrentTab] = useState<'tokens' | 'lists'>('lists')

  const onBack = () => {
    console.log('TODO onBack')
  }

  const onClose = () => {
    console.log('TODO onClose')
  }

  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack} onClose={onClose}>
        Manage
      </ModalHeader>
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
