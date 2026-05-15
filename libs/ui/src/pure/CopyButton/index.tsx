import { type ButtonHTMLAttributes, type MouseEvent, type ReactNode, useCallback } from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/react/macro'
import { Check, Copy } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { LinkStyledButton } from '../LinkStyledButton'
import { NewTooltip } from '../Tooltip/Tooltip'

export interface CopyButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'children' | 'onCopy'> {
  value: string
  children?: ReactNode
  iconOnly?: boolean
  iconSize?: number
  iconPosition?: 'left' | 'right'
  timeoutMs?: number
}

const StyledCopyButton = styled(LinkStyledButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: inherit;

  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
    color: inherit;
  }
`

const IconWrapper = styled.span<{ $isCopied?: boolean }>`
  display: inline-flex;
  color: ${({ $isCopied }) => ($isCopied ? `var(${UI.COLOR_SUCCESS})` : 'inherit')};
`

export function CopyButton({
  value,
  children,
  iconOnly = false,
  iconSize = 16,
  iconPosition = 'left',
  timeoutMs,
  onClick,
  disabled,
  type = 'button',
  ...rest
}: CopyButtonProps): ReactNode {
  const [isCopied, setCopied] = useCopyClipboard(timeoutMs)

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)

      if (event.defaultPrevented || disabled) return

      setCopied(value)
    },
    [disabled, onClick, setCopied, value],
  )

  const Icon = isCopied ? Check : Copy
  const icon = (
    <IconWrapper $isCopied={isCopied}>
      <Icon size={iconSize} />
    </IconWrapper>
  )
  const content = iconOnly ? null : children
  const tooltip = isCopied ? <Trans>Copied</Trans> : <Trans>Copy to clipboard</Trans>
  const button = (
    <StyledCopyButton type={type} onClick={handleClick} disabled={disabled} {...rest}>
      {iconPosition === 'left' ? icon : content}
      {iconPosition === 'left' ? content : icon}
    </StyledCopyButton>
  )

  return (
    <NewTooltip content={tooltip} placement="top">
      {button}
    </NewTooltip>
  )
}
