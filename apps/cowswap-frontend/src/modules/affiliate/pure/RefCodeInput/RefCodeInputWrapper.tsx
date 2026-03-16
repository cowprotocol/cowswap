import { PropsWithChildren, ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

interface RefCodeInputWrapperProps extends PropsWithChildren {
  hasError: boolean
  disabled: boolean
  isLoading: boolean
  compactSize?: boolean
  isAdornmentWrappable?: boolean
}

export function RefCodeInputWrapper({
  hasError,
  disabled,
  isLoading,
  compactSize,
  isAdornmentWrappable = false,
  ...rest
}: RefCodeInputWrapperProps): ReactNode {
  return (
    <InputWrapper
      $hasError={hasError}
      $disabled={disabled}
      $isLoading={isLoading}
      $compactSize={compactSize}
      $isAdornmentWrappable={isAdornmentWrappable}
      {...rest}
    />
  )
}

const InputWrapper = styled.div<{
  $hasError: boolean
  $disabled: boolean
  $isLoading: boolean
  $compactSize?: boolean
  $isAdornmentWrappable: boolean
}>`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  --ref-input-pad-y: ${({ $compactSize }) => ($compactSize ? '10px' : '12px')};
  --ref-input-pad-x: ${({ $compactSize }) => ($compactSize ? '12px' : '14px')};
  gap: 12px;
  border: 1px solid ${({ $hasError }) => ($hasError ? `var(${UI.COLOR_DANGER})` : `var(${UI.COLOR_BORDER})`)};
  background: ${({ $hasError, $disabled }) =>
    $hasError ? `var(${UI.COLOR_DANGER_BG})` : $disabled ? `var(${UI.COLOR_PAPER})` : `var(${UI.COLOR_PAPER_DARKER})`};
  color: ${({ $hasError }) => ($hasError ? `var(${UI.COLOR_DANGER_TEXT})` : `var(${UI.COLOR_TEXT})`)};
  border-radius: 9px;
  padding: var(--ref-input-pad-y) var(--ref-input-pad-x);
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

  ${({ $isAdornmentWrappable }) =>
    $isAdornmentWrappable &&
    css`
      ${Media.upToExtraSmall()} {
        flex-wrap: wrap;
        align-items: stretch;
        gap: 12px;

        input {
          flex: 1 1 100%;
          min-width: 0;
          min-height: 32px;
        }

        > div {
          flex: 1 1 100%;
          min-width: 0;
          margin: 0 calc(var(--ref-input-pad-x) * -1) calc(var(--ref-input-pad-y) * -1);
          width: calc(100% + (var(--ref-input-pad-x) * 2));
        }
      }
    `}
`
