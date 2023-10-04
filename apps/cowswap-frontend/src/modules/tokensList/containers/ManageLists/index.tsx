import { useMemo } from 'react'

import {
  ListSearchResponse,
  TokenListInfo,
  useActiveTokenListsIds,
  useRemoveCustomTokenLists,
  useToggleListCallback,
} from '@cowprotocol/tokens'

import * as styledEl from './styled'

import { useAddListImport } from '../../hooks/useAddListImport'
import { ImportTokenListItem } from '../../pure/ImportTokenListItem'
import { TokenListItem } from '../../pure/TokenListItem'

export interface ManageListsProps {
  lists: TokenListInfo[]
  listSearchResponse: ListSearchResponse
}

export function ManageLists(props: ManageListsProps) {
  const { lists, listSearchResponse } = props

  const activeTokenListsIds = useActiveTokenListsIds()
  const addListImport = useAddListImport()
  const removeCustomTokenLists = useRemoveCustomTokenLists()
  const toggleList = useToggleListCallback()

  const { source, listToImport } = useMemo(() => {
    const source = listSearchResponse.source

    if (listSearchResponse.source === 'existing') {
      return {
        source,
        loading: false,
        listToImport: listSearchResponse.response,
      }
    } else {
      if (!listSearchResponse.response) {
        return { source, loading: false, list: null }
      }

      const { isLoading, data } = listSearchResponse.response

      return {
        source,
        loading: isLoading,
        listToImport: data || null,
      }
    }
  }, [listSearchResponse])

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
      <styledEl.ListsContainer>
        {lists.map((list) => (
          <TokenListItem
            key={list.id}
            list={list}
            enabled={activeTokenListsIds[list.id]}
            removeList={removeCustomTokenLists}
            toggleList={toggleList}
          />
        ))}
      </styledEl.ListsContainer>
    </styledEl.Wrapper>
  )
}
