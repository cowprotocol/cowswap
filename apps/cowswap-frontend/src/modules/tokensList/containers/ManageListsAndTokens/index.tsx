import { useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isAddress, parseENSAddress, uriToHttp } from '@cowprotocol/common-utils'
import { ListState, useSearchList, useSearchToken } from '@cowprotocol/tokens'

import * as styledEl from './styled'

import { ModalHeader } from '../../pure/ModalHeader'
import { ManageLists } from '../ManageLists'
import { ManageTokens } from '../ManageTokens'

export interface ManageListsAndTokensProps {
  lists: ListState[]
  customTokens: TokenWithLogo[]
  onBack(): void
  onDismiss(): void
}

const tokensInputPlaceholder = '0x0000'
const listsInputPlaceholder = 'https:// or ipfs:// or ENS name'

export function ManageListsAndTokens(props: ManageListsAndTokensProps) {
  const { lists, customTokens, onBack, onDismiss } = props

  const [currentTab, setCurrentTab] = useState<'tokens' | 'lists'>('lists')
  const [inputValue, setInputValue] = useState<string>('')

  const isListsTab = currentTab === 'lists'

  const tokenInput = !isListsTab ? inputValue : null
  const listInput = isListsTab ? inputValue : null

  const isTokenAddressValid = useMemo(() => {
    if (!tokenInput) return true

    return !!isAddress(tokenInput)
  }, [tokenInput])

  const isListUrlValid = useMemo(() => {
    if (!listInput) return true

    return uriToHttp(listInput).length > 0 || Boolean(parseENSAddress(listInput))
  }, [listInput])

  const tokenSearchResponse = useSearchToken(isTokenAddressValid ? tokenInput : null)
  const listSearchResponse = useSearchList(isListUrlValid ? listInput : null)

  const setListsTab = () => {
    setCurrentTab('lists')
    setInputValue('')
  }

  const setTokensTab = () => {
    setCurrentTab('tokens')
    setInputValue('')
  }

  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack} onClose={onDismiss}>
        Manage
      </ModalHeader>
      <styledEl.TabsContainer>
        <styledEl.Tab active$={isListsTab} onClick={setListsTab}>
          Lists
        </styledEl.Tab>
        <styledEl.Tab active$={!isListsTab} onClick={setTokensTab}>
          Tokens
        </styledEl.Tab>
      </styledEl.TabsContainer>
      <styledEl.PrimaryInputBox>
        <styledEl.PrimaryInput
          type="text"
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isListsTab ? listsInputPlaceholder : tokensInputPlaceholder}
        />
        {!isListUrlValid && <styledEl.InputError>Enter valid list location</styledEl.InputError>}
        {!isTokenAddressValid && <styledEl.InputError>Enter valid token address</styledEl.InputError>}
      </styledEl.PrimaryInputBox>
      {currentTab === 'lists' ? (
        <ManageLists listSearchResponse={listSearchResponse} lists={lists} />
      ) : (
        <ManageTokens tokenSearchResponse={tokenSearchResponse} tokens={customTokens} />
      )}
    </styledEl.Wrapper>
  )
}
