import React from 'react'

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

// Allow decimal point at any position, including at the end
const inputRegex = /^(\d*\.?\d*)?$/

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export const Input = React.memo(function InnerInput({
  value,
  readOnly,
  onUserInput,
  placeholder,
  prependSymbol,
  onFocus,
  pattern: _pattern,
  ...rest
}: {
  value: string | number
  readOnly?: boolean
  onUserInput: (input: string) => void
  error?: boolean
  fontSize?: string
  align?: 'right' | 'left'
  prependSymbol?: string | undefined
  pattern?: string
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  // Keep the input strictly as a string
  const stringValue = typeof value === 'string' ? value : String(value)

  const titleRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      if (node) {
        node.title = node.scrollWidth > node.clientWidth ? stringValue : ''
      }
    },
    [stringValue],
  )

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const enforcer = (nextUserInput: string) => {
    // Always allow empty input
    if (nextUserInput === '') {
      onUserInput('')
      return
    }

    // Convert commas to dots
    const sanitizedValue = nextUserInput.replace(/,/g, '.')

    // Allow the value if it matches our number format
    if (inputRegex.test(sanitizedValue)) {
      onUserInput(sanitizedValue)
    }
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData('text')

    // Clean up pasted content - only allow numbers and single decimal
    const cleanedText = pastedText
      .replace(/,/g, '.') // Convert commas to dots
      .replace(/[^\d.]/g, '') // Remove non-numeric/dot chars
      .replace(/(\..*)\./g, '$1') // Keep only the first decimal point
      .replace(/\.$/, '') // Remove trailing decimal point

    if (inputRegex.test(cleanedText)) {
      event.preventDefault()
      enforcer(cleanedText)
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
        ref={titleRef}
        value={stringValue}
        readOnly={readOnly}
        onFocus={(event) => {
          autofocus(event)
          onFocus?.(event)
        }}
        onChange={(event) => {
          const rawValue = event.target.value

          if (prependSymbol) {
            // Remove prepended symbol if it appears in rawValue
            const formattedValue = rawValue.includes(prependSymbol) ? rawValue.slice(prependSymbol.length) : rawValue
            enforcer(formattedValue)
          } else {
            enforcer(rawValue)
          }
        }}
        onPaste={handlePaste}
        // Use text inputMode so decimals can be typed
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        // Keep type="text" to preserve trailing decimals
        type="text"
        placeholder={placeholder || '0'}
        // minLength to 0 so empty strings are always valid
        minLength={0}
        maxLength={79}
        spellCheck="false"
      />
    </>
  )
})

export default Input
