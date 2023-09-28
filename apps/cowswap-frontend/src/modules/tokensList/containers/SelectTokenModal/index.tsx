import { AllTokensList } from '../../pure/AllTokensList'
import { FavouriteTokensList } from '../../pure/FavouriteTokensList'
import { TokenWithLogo } from '../../types'

export interface SelectTokenModalProps {
  allTokens: TokenWithLogo[]
  favouriteTokens: TokenWithLogo[]
}

export function SelectTokenModal(props: SelectTokenModalProps) {
  const { favouriteTokens, allTokens } = props

  return (
    <div>
      <div>
        <h3>Select a token</h3>
        <button>x</button>
      </div>
      <div>
        <input type="text" placeholder="Search name or past address" />
      </div>
      <div>
        <FavouriteTokensList tokens={favouriteTokens} />
      </div>
      <div>
        <AllTokensList tokens={allTokens} />
      </div>
      <div>
        <button>Manage Token Lists</button>
      </div>
    </div>
  )
}
