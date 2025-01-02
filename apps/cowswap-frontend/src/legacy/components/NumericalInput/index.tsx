import React from 'react'

import { escapeRegExp } from '@cowprotocol/common-utils'
import { UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

import { autofocus } from 'common/utils/autofocus'

const textStyle = css<{ error?: boolean; fontSize?: string }>`
  color: ${({ error }) => (error ? `var(${UI.COLOR_DANGER})` : 'inherit')};
  font-size: ${({ fontSize }) => fontSize ?? '28px'};
  font-weight: 500;
`

const PrependSymbol = styled.span<{ error?: boolean; fontSize?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  user-select: none;
  ${textStyle}
`

const StyledInput = styled.input<{ error?: boolean; fontSize?: string; align?: string }>`
  ${textStyle}
  width: 0;
  position: relative;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background-color: var(${UI.COLOR_PAPER});
  text-align: ${({ align }) => align || 'right'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  input[type='number'] {
    appearance: none;
  }

  input[type='number']:focus,
  input[type='number']:hover {
    appearance: auto;
  }

  ::placeholder {
    color: inherit;
  }
`

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export const Input = React.memo(function InnerInput({
  value,
  readOnly,
  onUserInput,
  placeholder,
  prependSymbol,
  type,
  onFocus,
  ...rest
}: {
  value: string | number
  readOnly?: boolean
  onUserInput: (input: string) => void
  error?: boolean
  fontSize?: string
  align?: 'right' | 'left'
  prependSymbol?: string | undefined
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput)
    }
  }

  return (
    <>
      {prependSymbol && (
        <PrependSymbol error={rest.error} fontSize={rest.fontSize}>
          {prependSymbol}
        </PrependSymbol>
      )}
      <StyledInput
        {...rest}
        value={value}
        readOnly={readOnly}
        onFocus={(event) => {
          autofocus(event)
          onFocus?.(event)
        }}
        onChange={(event) => {
          if (prependSymbol) {
            const value = event.target.value

            // cut off prepended symbol
            const formattedValue = value.toString().includes(prependSymbol)
              ? value.toString().slice(1, value.toString().length + 1)
              : value

            // replace commas with periods, because uniswap exclusively uses period as the decimal separator
            enforcer(formattedValue.replace(/,/g, '.'))
          } else {
            enforcer(event.target.value.replace(/,/g, '.'))
          }
        }}
        // universal input options
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        // text-specific options
        type={type || 'text'}
        pattern="^[0-9]*[.,]?[0-9]*$"
        placeholder={placeholder || '0.0'}
        minLength={1}
        maxLength={32}
        spellCheck="false"
      />
    </>
  )
})

export default Input

// const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
