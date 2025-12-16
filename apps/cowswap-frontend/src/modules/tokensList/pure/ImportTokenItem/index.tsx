import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { Trans } from '@lingui/react/macro'
import { CheckCircle } from 'react-feather'

import * as styledEl from './styled'

import { ImportButton } from '../commonElements'
import { TokenInfo } from '../TokenInfo'

export interface ImportTokenItemProps {
  token: TokenWithLogo
  importToken?(token: TokenWithLogo): void
  existing?: true
  shadowed?: boolean
  wrapperId?: string
  isFirstInSection?: boolean
  isLastInSection?: boolean
}

export function ImportTokenItem(props: ImportTokenItemProps): ReactNode {
  const { token, importToken, shadowed, existing, wrapperId, isFirstInSection, isLastInSection } = props
  return (
    <styledEl.Wrapper id={wrapperId} $isFirst={isFirstInSection} $isLast={isLastInSection}>
      <div style={{ opacity: shadowed ? 0.6 : 1 }}>
        <TokenInfo token={token} />
      </div>
      <div>
        {existing && (
          <styledEl.ActiveToken>
            <CheckCircle size={16} strokeWidth={2} />
            <span>
              <Trans>Active</Trans>
            </span>
          </styledEl.ActiveToken>
        )}
        {importToken && (
          <ImportButton onClick={() => importToken(token)}>
            <Trans>Import</Trans>
          </ImportButton>
        )}
      </div>
    </styledEl.Wrapper>
  )
}
