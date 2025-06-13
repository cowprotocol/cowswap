import { TokenWithLogo } from '@cowprotocol/common-const'

import { CheckCircle } from 'react-feather'

import * as styledEl from './styled'

import { ImportButton } from '../commonElements'
import { TokenInfo } from '../TokenInfo'

export interface ImportTokenItemProps {
  token: TokenWithLogo
  importToken?(token: TokenWithLogo): void
  existing?: true
  shadowed?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ImportTokenItem(props: ImportTokenItemProps) {
  const { token, importToken, shadowed, existing } = props
  return (
    <styledEl.Wrapper>
      <div style={{ opacity: shadowed ? 0.6 : 1 }}>
        <TokenInfo token={token} />
      </div>
      <div>
        {existing && (
          <styledEl.ActiveToken>
            <CheckCircle size={16} strokeWidth={2} />
            <span>Active</span>
          </styledEl.ActiveToken>
        )}
        {importToken && <ImportButton onClick={() => importToken(token)}>Import</ImportButton>}
      </div>
    </styledEl.Wrapper>
  )
}
