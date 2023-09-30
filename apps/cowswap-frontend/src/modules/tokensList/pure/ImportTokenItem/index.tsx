import * as styledEl from './styled'

import { TokenWithLogo } from '../../types'
import { TokenInfo } from '../TokenInfo'

export interface ImportTokenItemProps {
  token: TokenWithLogo
  importToken(token: TokenWithLogo): void
  shadowed?: boolean
}

export function ImportTokenItem(props: ImportTokenItemProps) {
  const { token, importToken, shadowed } = props
  return (
    <styledEl.Wrapper>
      <div style={{ opacity: shadowed ? 0.6 : 1 }}>
        <TokenInfo token={token} />
      </div>
      <div>
        <styledEl.ImportButton onClick={() => importToken(token)}>Import</styledEl.ImportButton>
      </div>
    </styledEl.Wrapper>
  )
}
