import { useState } from 'react'

import { RowBetween } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { ArrowLeft } from 'react-feather'
import { Text } from 'rebass'

import { CurrencyModalView } from 'legacy/components/SearchModal/CurrencySearchModal'
import { ManageLists } from 'legacy/components/SearchModal/ManageLists'
import ManageTokens from 'legacy/components/SearchModal/ManageTokens'
import { PaddedColumn, Separator } from 'legacy/components/SearchModal/styleds'
import { CloseIcon } from 'legacy/theme'

import { ManageProps, Wrapper } from './index'

export default function Manage({
  onDismiss,
  setModalView,
  setImportList,
  setImportToken,
  setListUrl,
  ToggleOption,
  ToggleWrapper,
}: ManageProps) {
  // toggle between tokens and lists
  const [showLists, setShowLists] = useState(true)

  return (
    <Wrapper>
      <PaddedColumn>
        <RowBetween>
          <ArrowLeft style={{ cursor: 'pointer' }} onClick={() => setModalView(CurrencyModalView.search)} />
          <Text fontWeight={500} fontSize={20}>
            <Trans>Manage</Trans>
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
      </PaddedColumn>
      <Separator />
      <PaddedColumn style={{ paddingBottom: 0 }}>
        <ToggleWrapper>
          <ToggleOption onClick={() => setShowLists((state) => !state)} active={showLists}>
            <Trans>Lists</Trans>
          </ToggleOption>
          <ToggleOption onClick={() => setShowLists((state) => !state)} active={!showLists}>
            <Trans>Tokens</Trans>
          </ToggleOption>
        </ToggleWrapper>
      </PaddedColumn>
      {showLists ? (
        <ManageLists setModalView={setModalView} setImportList={setImportList} setListUrl={setListUrl} />
      ) : (
        <ManageTokens setModalView={setModalView} setImportToken={setImportToken} />
      )}
    </Wrapper>
  )
}
