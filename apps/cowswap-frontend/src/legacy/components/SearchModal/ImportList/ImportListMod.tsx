import { useCallback, useState } from 'react'

import { Trans } from '@lingui/macro'
import { transparentize } from 'polished'
import { AlertTriangle, ArrowLeft } from 'react-feather'
import styled from 'styled-components/macro'

import { addListAnalytics } from 'legacy/components/analytics'
import { ButtonPrimary } from 'legacy/components/Button'
import { AutoColumn } from 'legacy/components/Column'
import ListLogo from 'legacy/components/ListLogo'
import { AutoRow, RowBetween, RowFixed } from 'legacy/components/Row'
import { CurrencyModalView } from 'legacy/components/SearchModal/CurrencySearchModal'
import { Card } from 'legacy/components/SearchModal/ManageLists'
import { Checkbox, PaddedColumn, TextDot } from 'legacy/components/SearchModal/styleds'
import { SectionBreak } from 'legacy/components/swap/styleds'
import { useFetchListCallback } from 'legacy/hooks/useFetchListCallback'
import useTheme from 'legacy/hooks/useTheme'
import { useAllLists } from 'legacy/state/lists/hooks'
import { CloseIcon, ThemedText } from 'legacy/theme'
import { ExternalLink } from 'legacy/theme'

import { ImportProps } from './index'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: auto;
`

export function ImportList({ listURL, list, setModalView, onDismiss, enableList, removeList }: Required<ImportProps>) {
  const theme = useTheme()

  // user must accept
  const [confirmed, setConfirmed] = useState(false)

  const lists = useAllLists()
  const fetchList = useFetchListCallback()

  // monitor is list is loading
  const adding = Boolean(lists[listURL]?.loadingRequestId)
  const [addError, setAddError] = useState<string | null>(null)

  const handleAddList = useCallback(() => {
    if (adding) return
    setAddError(null)
    fetchList(listURL)
      .then(() => {
        addListAnalytics('Success', listURL)
        // turn list on
        enableList(listURL)
        // go back to lists
        setModalView(CurrencyModalView.manage)
      })
      .catch((error) => {
        addListAnalytics('Failed', listURL)
        setAddError(error.message)
        removeList(listURL)
      })
  }, [adding, enableList, fetchList, listURL, removeList, setModalView])

  return (
    <Wrapper>
      <PaddedColumn gap="14px" style={{ width: '100%', flex: '1 1' }}>
        <RowBetween>
          <ArrowLeft style={{ cursor: 'pointer' }} onClick={() => setModalView(CurrencyModalView.manage)} />
          <ThemedText.MediumHeader>
            <Trans>Import List</Trans>
          </ThemedText.MediumHeader>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
      </PaddedColumn>
      <SectionBreak />
      <PaddedColumn gap="md">
        <AutoColumn gap="md">
          <Card backgroundColor={theme.bg2} padding="12px 20px">
            <RowBetween>
              <RowFixed>
                {list.logoURI && <ListLogo logoURI={list.logoURI} size="40px" />}
                <AutoColumn gap="sm" style={{ marginLeft: '20px', wordBreak: 'break-all' }}>
                  <RowFixed>
                    <ThemedText.Body fontWeight={600} mr="6px">
                      {list.name}
                    </ThemedText.Body>
                    <TextDot />
                    <ThemedText.Main fontSize={'16px'} ml="6px">
                      <Trans>{list.tokens.length} tokens</Trans>
                    </ThemedText.Main>
                  </RowFixed>
                  <ExternalLink href={`https://tokenlists.org/token-list?url=${listURL}`}>
                    <ThemedText.Main fontSize={'12px'} color={theme.blue1}>
                      {listURL}
                    </ThemedText.Main>
                  </ExternalLink>
                </AutoColumn>
              </RowFixed>
            </RowBetween>
          </Card>
          <Card style={{ backgroundColor: transparentize(0.8, theme.red1) }}>
            <AutoColumn justify="center" style={{ textAlign: 'center', gap: '16px', marginBottom: '12px' }}>
              <AlertTriangle stroke={theme.red1} size={32} />
              <ThemedText.Body fontWeight={500} fontSize={20} color={theme.red1}>
                <Trans>Import at your own risk</Trans>
              </ThemedText.Body>
            </AutoColumn>

            <AutoColumn style={{ textAlign: 'center', gap: '16px', marginBottom: '12px' }}>
              <ThemedText.Body fontWeight={500} color={theme.red1}>
                <Trans>
                  By adding this list you are implicitly trusting that the data is correct. Anyone can create a list,
                  including creating fake versions of existing lists and lists that claim to represent projects that do
                  not have one.
                </Trans>
              </ThemedText.Body>
              <ThemedText.Body fontWeight={600} color={theme.red1}>
                <Trans>If you purchase a token from this list, you may not be able to sell it back.</Trans>
              </ThemedText.Body>
            </AutoColumn>
            <AutoRow justify="center" style={{ cursor: 'pointer' }} onClick={() => setConfirmed(!confirmed)}>
              <Checkbox
                name="confirmed"
                type="checkbox"
                checked={confirmed}
                onChange={() => setConfirmed(!confirmed)}
              />
              <ThemedText.Body ml="10px" fontSize="16px" color={theme.red1} fontWeight={500}>
                <Trans>I understand</Trans>
              </ThemedText.Body>
            </AutoRow>
          </Card>

          <ButtonPrimary
            disabled={!confirmed}
            altDisabledStyle={true}
            $borderRadius="20px"
            padding="10px 1rem"
            onClick={handleAddList}
          >
            <Trans>Import</Trans>
          </ButtonPrimary>
          {addError ? (
            <ThemedText.Error title={addError} style={{ textOverflow: 'ellipsis', overflow: 'hidden' }} error>
              {addError}
            </ThemedText.Error>
          ) : null}
        </AutoColumn>
      </PaddedColumn>
    </Wrapper>
  )
}
