import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { RefCodeAdornment, type RefCodeAdornmentVariant } from './RefCodeAdornment'
import { RefCodeInputField, RefCodeInputFieldProps } from './RefCodeInputField'
import { RefCodeInputWrapper } from './RefCodeInputWrapper'

export interface RefCodeInputProps extends RefCodeInputFieldProps {
  hasError: boolean
  isLoading: boolean
  disabled: boolean
  adornmentVariant?: RefCodeAdornmentVariant
  connectedBelow?: boolean
}

export function RefCodeInput({
  hasError,
  isLoading,
  adornmentVariant,
  connectedBelow,
  compactSize,
  disabled,
  autoFocus,
  ...inputProps
}: RefCodeInputProps): ReactNode {
  const isSmallViewport = useMediaQuery(Media.upToSmall(false))
  const isAdornmentWrappable = !!adornmentVariant && adornmentVariant !== 'error'
  const resolvedAutoFocus = autoFocus ?? !isSmallViewport

  return (
    <RefCodeInputWrapper
      hasError={hasError}
      disabled={disabled}
      isLoading={isLoading || adornmentVariant === 'checking'}
      compactSize={compactSize}
      isAdornmentWrappable={isAdornmentWrappable}
      connectedBelow={connectedBelow}
    >
      <RefCodeInputField disabled={disabled} compactSize={compactSize} autoFocus={resolvedAutoFocus} {...inputProps} />
      <RefCodeAdornment variant={adornmentVariant} isAdornmentWrappable={isAdornmentWrappable} />
    </RefCodeInputWrapper>
  )
}
