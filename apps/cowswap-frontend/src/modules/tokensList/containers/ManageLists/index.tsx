import { TokenListInfo } from '@cowprotocol/tokens'

import * as styledEl from './styled'

import { ImportTokenListItem } from '../../pure/ImportTokenListItem'
import { LoadedTokenListItem } from '../../pure/LoadedTokenListItem'
import { TokenListItem } from '../../pure/TokenListItem'

export interface ManageListsProps {
  lists: TokenListInfo[]
  loadedLists?: TokenListInfo[]
  listsToImport?: TokenListInfo[]
}

export function ManageLists(props: ManageListsProps) {
  const { lists, loadedLists, listsToImport } = props

  const viewList = (id: string) => {
    console.log('TODO viewList', id)
  }

  const removeList = (id: string) => {
    console.log('TODO removeList', id)
  }

  const importList = (list: TokenListInfo) => {
    console.log('TODO importList', list.id)
  }

  return (
    <styledEl.Wrapper>
      {!!loadedLists?.length && (
        <styledEl.ImportListsContainer>
          {loadedLists.map((list) => (
            <LoadedTokenListItem key={list.id} list={list} />
          ))}
        </styledEl.ImportListsContainer>
      )}
      {!!listsToImport?.length && (
        <styledEl.ImportListsContainer>
          {listsToImport.map((list) => (
            <ImportTokenListItem key={list.id} list={list} importList={importList} />
          ))}
        </styledEl.ImportListsContainer>
      )}
      <styledEl.ListsContainer>
        {lists.map((list) => (
          <TokenListItem key={list.id} list={list} viewList={viewList} removeList={removeList} />
        ))}
      </styledEl.ListsContainer>
    </styledEl.Wrapper>
  )
}
