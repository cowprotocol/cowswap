import { ReactNode, useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isAddress, parseENSAddress, uriToHttp } from '@cowprotocol/common-utils'
import { ListState, useSearchList, useSearchToken } from '@cowprotocol/tokens'
import { ModalHeader } from '@cowprotocol/ui'

import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'

import * as styledEl from './styled'

import { ManageLists } from '../ManageLists'
import { ManageTokens } from '../ManageTokens'

export interface ManageListsAndTokensProps {
  lists: ListState[]
  customTokens: TokenWithLogo[]
  onBack(): void
  onDismiss?(): void
}

const tokensInputPlaceholder = '0x0000'
const listsInputPlaceholder = msg`https:// or ipfs:// or ENS name`

export function ManageListsAndTokens(props: ManageListsAndTokensProps): ReactNode {
  const { i18n } = useLingui()
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
    if (!listInput) return false

    return uriToHttp(listInput).length > 0 || Boolean(parseENSAddress(listInput))
  }, [listInput])

  const tokenSearchResponse = useSearchToken(isTokenAddressValid ? tokenInput : null)
  const listSearchResponse = useSearchList(isListUrlValid ? listInput : null)

  const setListsTab = (): void => {
    setCurrentTab('lists')
    setInputValue('')
  }

  const setTokensTab = (): void => {
    setCurrentTab('tokens')
    setInputValue('')
  }
  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack} onClose={onDismiss}>
        <Trans>Manage</Trans>
      </ModalHeader>
      <styledEl.TabsContainer>
        <styledEl.Tab active$={isListsTab} onClick={setListsTab}>
          <Trans>Lists</Trans>
        </styledEl.Tab>
        <styledEl.Tab active$={!isListsTab} onClick={setTokensTab}>
          <Trans>Tokens</Trans>
        </styledEl.Tab>
      </styledEl.TabsContainer>
      <styledEl.PrimaryInputBox>
        <styledEl.PrimaryInput
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isListsTab ? i18n._(listsInputPlaceholder) : tokensInputPlaceholder}
          type="text"
        />
        {!isListUrlValid && listInput && (
          <styledEl.InputError>
            <Trans>Enter valid list location</Trans>
          </styledEl.InputError>
        )}
        {!isTokenAddressValid && (
          <styledEl.InputError>
            <Trans>Enter valid token address</Trans>
          </styledEl.InputError>
        )}
      </styledEl.PrimaryInputBox>
      {currentTab === 'lists' ? (
        <ManageLists listSearchResponse={listSearchResponse} lists={lists} isListUrlValid={isListUrlValid} />
      ) : (
        <ManageTokens tokenSearchResponse={tokenSearchResponse} tokens={customTokens} />
      )}
    </styledEl.Wrapper>
  )
}
