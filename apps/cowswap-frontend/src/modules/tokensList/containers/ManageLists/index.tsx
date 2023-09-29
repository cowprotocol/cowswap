import { Settings } from 'react-feather'

export interface TokenList {
  id: string
  name: string
  logoUrl: string
  url: string
  enabled: boolean
  tokensCount: number
}

export interface ManageListsProps {
  lists: TokenList[]
}

export function ManageLists(props: ManageListsProps) {
  const { lists } = props

  return (
    <div>
      <input type="text" placeholder="https:// or ipfs:// or ENS name" />
      <div>
        {lists.map((list) => {
          return (
            <div key={list.id}>
              <div>
                <div>
                  <img src={list.logoUrl} alt={list.name} width={36} height={36} />
                </div>
                <div>
                  <div>{list.name}</div>
                  <div>
                    {list.tokensCount} tokens <Settings />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
