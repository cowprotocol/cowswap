import { ChangeEvent, ReactNode, useCallback } from 'react'

import { getBlockExplorerUrl as getExplorerLink } from '@cowprotocol/common-utils'
import { useENS } from '@cowprotocol/ens'
import { RowBetween } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t, Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'

import { autofocus } from 'common/utils/autofocus'

const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 16px;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  z-index: 1;
  width: 100%;
`

const ContainerRow = styled.div<{ error: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  border: 0;
  color: inherit;
  background-color: var(${UI.COLOR_PAPER_DARKER});
`

export const InputContainer = styled.div`
  flex: 1;
  padding: 1rem;
`

const Input = styled.input<{ error?: boolean }>`
  font-size: 1.25rem;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background: none;
  transition: color 0.2s ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error }) => (error ? `var(${UI.COLOR_DANGER})` : 'inherit')};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;

  &&::placeholder {
    color: inherit;
    opacity: 0.5;
  }

  &:focus::placeholder {
    color: transparent;
  }

  padding: 0px;
  appearance: textfield;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

export function AddressInputPanel({
  id,
  className = 'recipient-address-input',
  label,
  placeholder,
  value,
  onChange,
}: {
  id?: string
  className?: string
  label?: ReactNode
  placeholder?: string
  value: string
  onChange: (value: string) => void
}) {
  const { chainId } = useWalletInfo()

  const { address, loading, name } = useENS(value)

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      const withoutSpaces = input.replace(/\s+/g, '')
      onChange(withoutSpaces)
    },
    [onChange]
  )

  const error = Boolean(value.length > 0 && !loading && !address)

  return (
    <InputPanel id={id}>
      <ContainerRow error={error}>
        <InputContainer>
          <AutoColumn gap="md">
            <RowBetween>
              <span>{label ?? <Trans>Recipient</Trans>}</span>
              {address && chainId && (
                <ExternalLink href={getExplorerLink(chainId, 'address', name ?? address)} style={{ fontSize: '14px' }}>
                  <Trans>(View on Explorer)</Trans>
                </ExternalLink>
              )}
            </RowBetween>
            <Input
              className={className}
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder={placeholder ?? t`Wallet Address or ENS name`}
              error={error}
              pattern="^(0x[a-fA-F0-9]{40})$"
              onChange={handleInput}
              value={value}
              onFocus={autofocus}
            />
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  )
}
