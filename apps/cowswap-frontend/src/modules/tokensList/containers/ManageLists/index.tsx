import * as styledEl from './styled'

import { PrimaryInput, PrimaryInputBox } from '../../pure/commonElements'
import { ImportTokenListItem } from '../../pure/ImportTokenListItem'
import { LoadedTokenListItem } from '../../pure/LoadedTokenListItem'
import { TokenListItem } from '../../pure/TokenListItem'
import { TokenList } from '../../types'

export interface ManageListsProps {
  lists: TokenList[]
  loadedLists?: TokenList[]
  listsToImport?: TokenList[]
}

export function ManageLists(props: ManageListsProps) {
  const { lists, loadedLists, listsToImport } = props

  const viewList = (id: string) => {
    console.log('TODO viewList', id)
  }

  const removeList = (id: string) => {
    console.log('TODO removeList', id)
  }

  const importList = (list: TokenList) => {
    console.log('TODO importList', list.id)
  }

  return (
    <styledEl.Wrapper>
      <PrimaryInputBox>
        <PrimaryInput type="text" placeholder="https:// or ipfs:// or ENS name" />
      </PrimaryInputBox>
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
