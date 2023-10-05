import { TokenWithLogo } from '@cowprotocol/common-const'

import * as styledEl from './styled'

import { ImportButton } from '../commonElements'
import { TokenInfo } from '../TokenInfo'

export interface ImportTokenItemProps {
  token: TokenWithLogo
  importToken?(token: TokenWithLogo): void
  existing?: true
  shadowed?: boolean
}

export function ImportTokenItem(props: ImportTokenItemProps) {
  const { token, importToken, shadowed, existing } = props
  return (
    <styledEl.Wrapper>
      <div style={{ opacity: shadowed ? 0.6 : 1 }}>
        <TokenInfo token={token} />
      </div>
      <div>
        {existing && <div>Existing</div>}
        {importToken && <ImportButton onClick={() => importToken(token)}>Import</ImportButton>}
      </div>
    </styledEl.Wrapper>
  )
}
