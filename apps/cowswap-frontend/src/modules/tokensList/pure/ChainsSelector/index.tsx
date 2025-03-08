import { ChainInfo } from '@cowprotocol/types'

import * as styledEl from './styled'

export interface ChainsSelectorProps {
  chains: ChainInfo[]
}

export function ChainsSelector() {
  return <styledEl.Wrapper>ChainsSelector</styledEl.Wrapper>
}
