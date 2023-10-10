import { useMemo } from 'react'

import {
  FetchedTokenList,
  ListSearchResponse,
  TokenListInfo,
  useActiveTokenListsIds,
  useRemoveTokenList,
  useToggleListCallback,
} from '@cowprotocol/tokens'

import * as styledEl from './styled'

import { useAddListImport } from '../../hooks/useAddListImport'
import { ImportTokenListItem } from '../../pure/ImportTokenListItem'
import { ListItem } from '../../pure/ListItem'

export interface ManageListsProps {
  lists: TokenListInfo[]
  listSearchResponse: ListSearchResponse
}

export function ManageLists(props: ManageListsProps) {
  const { lists, listSearchResponse } = props

  const activeTokenListsIds = useActiveTokenListsIds()
  const addListImport = useAddListImport()
  const removeCustomTokenLists = useRemoveTokenList()
  const toggleList = useToggleListCallback()

  const { source, listToImport } = useListSearchResponse(listSearchResponse)

  // TODO: add loading state
  return (
    <styledEl.Wrapper>
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
              key={list.id}
              list={list}
              enabled={!!activeTokenListsIds[list.id]}
              removeList={removeCustomTokenLists}
              toggleList={toggleList}
            />
          ))}
      </styledEl.ListsContainer>
    </styledEl.Wrapper>
  )
}

function useListSearchResponse(listSearchResponse: ListSearchResponse): {
  source: 'existing' | 'external'
  loading: boolean
  listToImport: FetchedTokenList | null
} {
  return useMemo(() => {
    const source = listSearchResponse.source

    if (listSearchResponse.source === 'existing') {
      return {
        source,
        loading: false,
        listToImport: { info: listSearchResponse.response, tokens: [] },
      }
    } else {
      if (!listSearchResponse.response) {
        return { source, loading: false, listToImport: null }
      }

      const { isLoading, data } = listSearchResponse.response

      return {
        source,
        loading: isLoading,
        listToImport: data || null,
      }
    }
  }, [listSearchResponse])
}
