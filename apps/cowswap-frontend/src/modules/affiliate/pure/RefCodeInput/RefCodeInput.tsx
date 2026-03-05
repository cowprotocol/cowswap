import { ReactNode } from 'react'

import { RefCodeAdornment, type RefCodeAdornmentVariant } from './RefCodeAdornment'
import { RefCodeInputField, RefCodeInputFieldProps } from './RefCodeInputField'
import { RefCodeInputWrapper } from './RefCodeInputWrapper'

export interface RefCodeInputProps extends RefCodeInputFieldProps {
  hasError: boolean
  isLoading: boolean
  disabled: boolean
  adornmentVariant?: RefCodeAdornmentVariant
}

export function RefCodeInput({
  hasError,
  isLoading,
  adornmentVariant,
  compactSize,
  disabled,
  ...inputProps
}: RefCodeInputProps): ReactNode {
  const isAdornmentWrappable = !!adornmentVariant && adornmentVariant !== 'error'

  return (
    <RefCodeInputWrapper
      hasError={hasError}
      disabled={disabled}
      isLoading={isLoading || adornmentVariant === 'checking'}
      compactSize={compactSize}
      isAdornmentWrappable={isAdornmentWrappable}
    >
      <RefCodeInputField disabled={disabled} compactSize={compactSize} {...inputProps} />
      <RefCodeAdornment variant={adornmentVariant} isAdornmentWrappable={isAdornmentWrappable} />
    </RefCodeInputWrapper>
  )
}
