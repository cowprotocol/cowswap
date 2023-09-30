import styled from 'styled-components/macro'

import { customTokensMock } from '../../mocks'
import { TokenList } from '../../pure/TokenListItem'

import { ManageListsAndTokens } from './index'

const Wrapper = styled.div`
  width: 450px;
`

const lists: TokenList[] = [
  {
    id: '1',
    name: 'CowSwap Goerli',
    url: 'https://tokenlists.org/token-list?url=https://raw.githubusercontent.com/cowprotocol/cowswap/develop/apps/cowswap-frontend/src/tokens/goerli-token-list.json',
    logoUrl: 'https://gnosis.mypinata.cloud/ipfs/Qme9B6jRpGtZsRFcPjHvA5T4ugFuL4c3SzWfxyMPa59AMo',
    tokensCount: 7,
    enabled: true,
    version: 'v0.0.0',
  },
  {
    id: '2',
    name: 'Compound',
    url: 'https://tokenlists.org/token-list?url=https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    logoUrl: 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/compound-interface.svg',
    tokensCount: 16,
    enabled: false,
    version: 'v0.2.1',
  },
]

const Fixtures = {
  default: (
    <Wrapper>
      <ManageListsAndTokens customTokens={customTokensMock} lists={lists} />
    </Wrapper>
  ),
}

export default Fixtures
