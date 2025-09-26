import { ReactNode, useCallback } from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/react/macro'
import { CheckCircle, Copy } from 'react-feather'
import styled from 'styled-components/macro'

import * as styledEl from './styled'

import { UI } from '../../enum'

const CopyFeedbackText = styled.span<{ isCopied?: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ isCopied }) => (isCopied ? `var(${UI.COLOR_SUCCESS})` : 'inherit')};
`

interface ContextMenuCopyButtonProps {
  address: string
}

export function ContextMenuCopyButton({ address }: ContextMenuCopyButtonProps): ReactNode {
  const [isCopied, setCopied] = useCopyClipboard()

  const handleCopyAddress = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setCopied(address)
    },
    [address, setCopied],
  )

  return (
    <styledEl.ContextMenuItemButton onClick={handleCopyAddress}>
      {isCopied ? (
        <>
          <CopyFeedbackText isCopied={isCopied}>
            <CheckCircle size={16} />
          </CopyFeedbackText>
          <CopyFeedbackText isCopied={isCopied}>
            <Trans>Copied</Trans>
          </CopyFeedbackText>
        </>
      ) : (
        <>
          <Copy size={16} />
          <span>
            <Trans>Copy address</Trans>
          </span>
        </>
      )}
    </styledEl.ContextMenuItemButton>
  )
}
