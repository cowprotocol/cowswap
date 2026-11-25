import { ReactNode, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ListSearchResponse, ListState, useListsEnabledState, useRemoveList } from '@cowprotocol/tokens'
import { Loader } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { useAddListImport } from '../../hooks/useAddListImport'
import { useConsentAwareToggleList } from '../../hooks/useConsentAwareToggleList'
import { ImportTokenListItem } from '../../pure/ImportTokenListItem'
import { ListItem } from '../../pure/ListItem'

export interface ManageListsProps {
  lists: ListState[]
  listSearchResponse: ListSearchResponse
  isListUrlValid?: boolean
}

interface ListSearchState {
  source: 'existing' | 'external'
  loading: boolean
  listToImport: ListState | null
}

export function ManageLists(props: ManageListsProps): ReactNode {
  const { lists, listSearchResponse, isListUrlValid } = props

  const activeTokenListsIds = useListsEnabledState()
  const addListImport = useAddListImport()
  const cowAnalytics = useCowAnalytics()
  const toggleList = useConsentAwareToggleList()

  const removeList = useRemoveList((source) => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIST,
      action: 'Remove List',
      label: source,
    })
  })

  const { source, listToImport, loading } = useListSearchResponse(listSearchResponse)

  return (
    <styledEl.Wrapper>
      {isListUrlValid && !listToImport?.list && !loading && (
        <styledEl.InputError>
          <Trans>Error importing token list</Trans>
        </styledEl.InputError>
      )}
      {loading && (
        <styledEl.LoaderWrapper>
          <Loader />
        </styledEl.LoaderWrapper>
      )}
      {listToImport && (
        <styledEl.ImportListsContainer>
          <ImportTokenListItem
            source={source}
            list={listToImport}
            data-click-event={toCowSwapGtmEvent({
              category: CowSwapAnalyticsCategory.LIST,
              action: 'Import List',
              label: listToImport.source,
            })}
            importList={() => {
              if (listToImport) {
                addListImport(listToImport)
              }
            }}
          />
        </styledEl.ImportListsContainer>
      )}
      <styledEl.ListsContainer id="tokens-lists-table">
        {[...lists]
          .sort((a, b) => (a.priority || 0) - (b.priority || 0))
          .map((list) => (
            <ListItem
              key={list.source}
              list={list}
              enabled={!!activeTokenListsIds[list.source]}
              removeList={removeList}
              toggleList={toggleList}
            />
          ))}
      </styledEl.ListsContainer>
    </styledEl.Wrapper>
  )
}

function useListSearchResponse(listSearchResponse: ListSearchResponse): ListSearchState {
  return useMemo(() => {
    const { source, response } = listSearchResponse

    if (source === 'existing') {
      return {
        source,
        loading: false,
        listToImport: response,
      }
    }

    if (!response) {
      return { source, loading: false, listToImport: null }
    }

    const { isLoading, data } = response

    return {
      source,
      loading: isLoading,
      listToImport: data || null,
    }
  }, [listSearchResponse])
}
