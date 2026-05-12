import { type ButtonHTMLAttributes, type MouseEvent, type ReactNode, useCallback } from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/react/macro'
import { Check, Copy } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { LinkStyledButton } from '../LinkStyledButton'
import { NewTooltip } from '../Tooltip'

export interface CopyButtonState {
  isCopied: boolean
}

type CopyButtonChildren = ReactNode | ((state: CopyButtonState) => ReactNode)

export interface CopyButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'children' | 'onCopy'> {
  value: string
  children?: CopyButtonChildren
  copiedLabel?: ReactNode
  idleLabel?: ReactNode
  showCopiedLabel?: boolean
  iconSize?: number
  iconPosition?: 'left' | 'right'
  color?: string
  timeoutMs?: number
  onCopy?: (value: string) => void
}

const StyledCopyButton = styled(LinkStyledButton)<{ $isCopied?: boolean; $color?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${({ $color, $isCopied }) => ($isCopied ? `var(${UI.COLOR_SUCCESS})` : ($color ?? 'inherit'))};

  &:hover,
  &:active,
  &:focus {
    text-decoration: none;
    color: ${({ $color, $isCopied }) => ($isCopied ? `var(${UI.COLOR_SUCCESS})` : ($color ?? 'inherit'))};
  }
`

export function CopyButton(props: CopyButtonProps): ReactNode {
  const {
    value,
    children,
    copiedLabel = <Trans>Copied</Trans>,
    idleLabel,
    showCopiedLabel = true,
    iconSize = 16,
    iconPosition = 'left',
    color,
    timeoutMs,
    onCopy,
    onClick,
    disabled,
    type,
    ...rest
  } = props
  const [isCopied, setCopied] = useCopyClipboard(timeoutMs)

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)

      if (event.defaultPrevented || disabled) return

      setCopied(value)
      onCopy?.(value)
    },
    [disabled, onClick, onCopy, setCopied, value],
  )

  const renderedChildren = typeof children === 'function' ? children({ isCopied }) : children
  const idleContent = renderedChildren ?? idleLabel
  const icon = isCopied ? <Check size={iconSize} /> : <Copy size={iconSize} />
  const content = isCopied ? showCopiedLabel ? <span>{copiedLabel}</span> : null : idleContent
  const button = (
    <StyledCopyButton
      type={type ?? 'button'}
      onClick={handleClick}
      disabled={disabled}
      $isCopied={isCopied}
      $color={color}
      {...rest}
    >
      {iconPosition === 'left' ? icon : content}
      {iconPosition === 'left' ? content : icon}
    </StyledCopyButton>
  )

  return !idleContent && !showCopiedLabel ? (
    <NewTooltip content={isCopied ? copiedLabel : 'Copy to clipboard'} placement="top" wrapInContainer>
      {button}
    </NewTooltip>
  ) : (
    button
  )
}
