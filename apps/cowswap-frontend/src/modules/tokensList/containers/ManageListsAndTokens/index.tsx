import { useAtomValue } from 'jotai'
import { ReactNode, useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isAddress, isDeprecatedTokenListProtocol, isValidTokenListSource } from '@cowprotocol/common-utils'
import { isSolanaAddress, isSolanaChain } from '@cowprotocol/cow-sdk'
import { environmentAtom, ListState, useSearchList, useSearchToken } from '@cowprotocol/tokens'
import { Modal } from '@cowprotocol/ui'

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
  const { chainId } = useAtomValue(environmentAtom)

  const [currentTab, setCurrentTab] = useState<'tokens' | 'lists'>('lists')
  const [inputValue, setInputValue] = useState<string>('')

  const isListsTab = currentTab === 'lists'

  const tokenInput = !isListsTab ? inputValue : null
  const listInput = isListsTab ? inputValue : null

  const isTokenAddressValid = useMemo(() => {
    if (!tokenInput) return true

    return isSolanaChain(chainId) ? isSolanaAddress(tokenInput) : !!isAddress(tokenInput)
  }, [tokenInput, chainId])

  // ipfs/ipns lists load here through an http gateway but are unreadable to the balances watcher,
  // and one of them fails its whole session - so they are no longer accepted
  const isListProtocolUnsupported = useMemo(() => {
    if (!listInput) return false

    return isDeprecatedTokenListProtocol(listInput)
  }, [listInput])

  const isListUrlValid = useMemo(() => {
    if (!listInput) return false

    return isValidTokenListSource(listInput) && !isListProtocolUnsupported
  }, [listInput, isListProtocolUnsupported])

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
      <Modal.Header onBack={onBack} onClose={onDismiss}>
        <Trans>Manage</Trans>
      </Modal.Header>
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
        {isListProtocolUnsupported && (
          <styledEl.InputError>
            <Trans>IPFS and IPNS token lists are no longer supported. Use an https list URL.</Trans>
          </styledEl.InputError>
        )}
        {!isListUrlValid && !isListProtocolUnsupported && listInput && (
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
