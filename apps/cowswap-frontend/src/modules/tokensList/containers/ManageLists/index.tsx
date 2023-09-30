import * as styledEl from './styled'

import { PrimaryInput } from '../../pure/commonElements'
import { TokenList, TokenListItem } from '../../pure/TokenListItem'

export interface ManageListsProps {
  lists: TokenList[]
}

export function ManageLists(props: ManageListsProps) {
  const { lists } = props

  const viewList = (id: string) => {
    console.log('TODO viewList', id)
  }

  const removeList = (id: string) => {
    console.log('TODO removeList', id)
  }

  return (
    <styledEl.Wrapper>
      <styledEl.Box>
        <PrimaryInput type="text" placeholder="https:// or ipfs:// or ENS name" />
      </styledEl.Box>
      <styledEl.ListsContainer>
        {lists.map((list) => (
          <TokenListItem key={list.id} list={list} viewList={viewList} removeList={removeList} />
        ))}
      </styledEl.ListsContainer>
    </styledEl.Wrapper>
  )
}
