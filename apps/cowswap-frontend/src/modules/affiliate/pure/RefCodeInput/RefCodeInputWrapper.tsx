import { PropsWithChildren, ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

interface RefCodeInputWrapperProps extends PropsWithChildren {
  hasError: boolean
  disabled: boolean
  isLoading: boolean
  compactSize?: boolean
  belowAdornmentMode?: 'none' | 'auto' | 'always'
}

export function RefCodeInputWrapper({
  hasError,
  disabled,
  isLoading,
  compactSize,
  belowAdornmentMode = 'none',
  ...rest
}: RefCodeInputWrapperProps): ReactNode {
  return (
    <InputWrapper
      $hasError={hasError}
      $disabled={disabled}
      $isLoading={isLoading}
      $compactSize={compactSize}
      $belowAdornmentMode={belowAdornmentMode}
      {...rest}
    />
  )
}

const InputWrapper = styled.div<{
  $hasError: boolean
  $disabled: boolean
  $isLoading: boolean
  $compactSize?: boolean
  $belowAdornmentMode: 'none' | 'auto' | 'always'
}>`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 12px;
  border: 1px solid ${({ $hasError }) => ($hasError ? `var(${UI.COLOR_DANGER})` : `var(${UI.COLOR_BORDER})`)};
  background: ${({ $hasError, $disabled }) =>
    $hasError ? `var(${UI.COLOR_DANGER_BG})` : $disabled ? `var(${UI.COLOR_PAPER})` : `var(${UI.COLOR_PAPER_DARKER})`};
  color: ${({ $hasError }) => ($hasError ? `var(${UI.COLOR_DANGER_TEXT})` : `var(${UI.COLOR_TEXT})`)};
  border-radius: ${({ $belowAdornmentMode }) => ($belowAdornmentMode === 'always' ? '9px 9px 0 0' : '9px')};
  padding: ${({ $compactSize }) => ($compactSize ? '10px 12px' : '12px 14px')};
  transition: border 0.2s ease;
  min-height: ${({ $compactSize }) => ($compactSize ? '48px' : '58px')};
  position: relative;
  overflow: hidden;
  font-size: 18px;

  &:focus-within {
    border-color: ${({ $hasError }) => ($hasError ? `var(${UI.COLOR_DANGER})` : `var(${UI.COLOR_PRIMARY_LIGHTER})`)};
  }

  ${({ $isLoading, theme }) =>
    $isLoading &&
    css`
      input {
        color: transparent;
        text-shadow: 0 0 0 var(${UI.COLOR_TEXT});
      }

      &::after {
        content: '';
        ${theme.shimmer};
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }
    `}

  ${({ $belowAdornmentMode }) =>
    $belowAdornmentMode === 'auto' &&
    css`
      ${Media.upToSmall()} {
        border-radius: 9px 9px 0 0;
      }
    `}
`
