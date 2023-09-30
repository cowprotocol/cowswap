import * as styledEl from './styled'

import { TokenWithLogo } from '../../types'
import { TokenInfo } from '../TokenInfo'

export interface ImportTokenItemProps {
  token: TokenWithLogo
  importToken(token: TokenWithLogo): void
}

export function ImportTokenItem(props: ImportTokenItemProps) {
  const { token, importToken } = props
  return (
    <styledEl.Wrapper>
      <div>
        <TokenInfo token={token} />
      </div>
      <div>
        <styledEl.ImportButton onClick={() => importToken(token)}>Import</styledEl.ImportButton>
      </div>
    </styledEl.Wrapper>
  )
}
