import { ReactNode } from 'react'

import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { RefCodeAdornment, type RefCodeAdornmentVariant } from './RefCodeAdornment'
import { RefCodeInputField, RefCodeInputFieldProps } from './RefCodeInputField'
import { RefCodeInputWrapper } from './RefCodeInputWrapper'

export interface RefCodeInputProps extends RefCodeInputFieldProps {
  hasError: boolean
  isLoading: boolean
  disabled: boolean
  adornmentVariant?: RefCodeAdornmentVariant
  adornmentPlacement?: 'auto' | 'below'
  adornmentLabel?: string
}

export function RefCodeInput({
  hasError,
  isLoading,
  adornmentVariant,
  adornmentPlacement = 'auto',
  adornmentLabel,
  compactSize,
  disabled,
  ...inputProps
}: RefCodeInputProps): ReactNode {
  const forceBelowAdornment = adornmentPlacement === 'below'
  const belowAdornmentMode = !adornmentVariant ? 'none' : forceBelowAdornment ? 'always' : 'auto'

  return (
    <InputWithStatusStack>
      <RefCodeInputWrapper
        hasError={hasError}
        disabled={disabled}
        isLoading={isLoading || adornmentVariant === 'checking'}
        compactSize={compactSize}
        belowAdornmentMode={belowAdornmentMode}
      >
        <RefCodeInputField disabled={disabled} compactSize={compactSize} {...inputProps} />
        <InlineAdornment $forceHidden={forceBelowAdornment}>
          <RefCodeAdornment variant={adornmentVariant} placement="inline" label={adornmentLabel} />
        </InlineAdornment>
      </RefCodeInputWrapper>
      {adornmentVariant && (
        <MobileAdornment $forceVisible={forceBelowAdornment}>
          <RefCodeAdornment variant={adornmentVariant} placement="below" label={adornmentLabel} />
        </MobileAdornment>
      )}
    </InputWithStatusStack>
  )
}

const InputWithStatusStack = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  gap: 0;
`

const InlineAdornment = styled.div<{ $forceHidden: boolean }>`
  display: ${({ $forceHidden }) => ($forceHidden ? 'none' : 'block')};

  ${Media.upToSmall()} {
    display: none;
  }
`

const MobileAdornment = styled.div<{ $forceVisible: boolean }>`
  display: ${({ $forceVisible }) => ($forceVisible ? 'flex' : 'none')};
  width: 100%;
  min-width: 0;

  ${Media.upToSmall()} {
    display: flex;
  }

  > * {
    width: 100%;
  }
`
