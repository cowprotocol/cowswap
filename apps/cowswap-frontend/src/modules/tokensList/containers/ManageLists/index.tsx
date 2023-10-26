import { useMemo } from 'react'

import { ListSearchResponse, ListState, useListsEnabledState, useRemoveList, useToggleList } from '@cowprotocol/tokens'
import { Loader } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { useAddListImport } from '../../hooks/useAddListImport'
import { ImportTokenListItem } from '../../pure/ImportTokenListItem'
import { ListItem } from '../../pure/ListItem'

interface ListSearchState {
  source: 'existing' | 'external'
  loading: boolean
  listToImport: ListState | null
}

export interface ManageListsProps {
  lists: ListState[]
  listSearchResponse: ListSearchResponse
}

export function ManageLists(props: ManageListsProps) {
  const { lists, listSearchResponse } = props

  const activeTokenListsIds = useListsEnabledState()
  const addListImport = useAddListImport()
  const removeList = useRemoveList()
  const toggleList = useToggleList()

  const { source, listToImport, loading } = useListSearchResponse(listSearchResponse)

  return (
    <styledEl.Wrapper>
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
            importList={() => listToImport && addListImport(listToImport)}
          />
        </styledEl.ImportListsContainer>
      )}
      <styledEl.ListsContainer id="tokens-lists-table">
        {lists
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
