import { Trans } from '@lingui/macro'
import { RowBetween } from 'components/Row'
import { useState } from 'react'
import { ArrowLeft } from 'react-feather'
import { Text } from 'rebass'
import { CloseIcon } from 'theme'
import { CurrencyModalView } from 'components/SearchModal/CurrencySearchModal'
import { ManageLists } from 'components/SearchModal/ManageLists'
import ManageTokens from 'components/SearchModal/ManageTokens'
import { PaddedColumn, Separator } from 'components/SearchModal/styleds'
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
