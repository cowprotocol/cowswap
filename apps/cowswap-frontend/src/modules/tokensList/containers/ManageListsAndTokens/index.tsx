import { useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenListInfo } from '@cowprotocol/tokens'

import * as styledEl from './styled'

import { ModalHeader } from '../../pure/ModalHeader'
import { ManageLists } from '../ManageLists'
import { ManageTokens } from '../ManageTokens'

export interface ManageListsAndTokensProps {
  lists: TokenListInfo[]
  customTokens: TokenWithLogo[]
  onBack(): void
  onDismiss(): void
}

const tokensInputPlaceholder = '0x0000'
const listsInputPlaceholder = 'https:// or ipfs:// or ENS name'

export function ManageListsAndTokens(props: ManageListsAndTokensProps) {
  const { lists, customTokens, onBack, onDismiss } = props

  const [currentTab, setCurrentTab] = useState<'tokens' | 'lists'>('lists')
  // TODO: process input value
  const [, setInputValue] = useState<string>('')

  const isListsTab = currentTab === 'lists'

  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack} onClose={onDismiss}>
        Manage
      </ModalHeader>
      <styledEl.TabsContainer>
        <styledEl.Tab active$={isListsTab} onClick={() => setCurrentTab('lists')}>
          Lists
        </styledEl.Tab>
        <styledEl.Tab active$={!isListsTab} onClick={() => setCurrentTab('tokens')}>
          Tokens
        </styledEl.Tab>
      </styledEl.TabsContainer>
      <styledEl.PrimaryInputBox>
        <styledEl.PrimaryInput
          type="text"
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isListsTab ? listsInputPlaceholder : tokensInputPlaceholder}
        />
      </styledEl.PrimaryInputBox>
      {currentTab === 'lists' ? <ManageLists lists={lists} /> : <ManageTokens tokens={customTokens} />}
    </styledEl.Wrapper>
  )
}
