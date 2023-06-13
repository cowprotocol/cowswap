import { ChangeEvent, Context, ReactNode, useCallback, useContext } from 'react'

import { Trans, t } from '@lingui/macro'
import styled, { DefaultTheme, ThemeContext } from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { RowBetween } from 'legacy/components/Row'
import useENS from 'legacy/hooks/useENS'
import { ExternalLink, ThemedText } from 'legacy/theme'
import { getBlockExplorerUrl as getExplorerLink } from 'legacy/utils'

import { useWalletInfo } from 'modules/wallet'

const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.grey1};
  z-index: 1;
  width: 100%;
`

const ContainerRow = styled.div<{ error: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  border: 0;
  background-color: ${({ theme }) => theme.grey1};
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
  transition: color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;

  &&::placeholder {
    color: ${({ theme }) => theme.text2};
  }

  &:focus::placeholder {
    color: transparent;
  }

  padding: 0px;
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
  // the typed string value
  value: string
  // triggers whenever the typed value changes
  onChange: (value: string) => void
}) {
  const { chainId } = useWalletInfo()
  const theme = useContext(ThemeContext as Context<DefaultTheme>)

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
              <ThemedText.Black color={theme.text1} fontWeight={500} fontSize={14}>
                {label ?? <Trans>Recipient</Trans>}
              </ThemedText.Black>
              {address && chainId && (
                <ExternalLink href={getExplorerLink(chainId, name ?? address, 'address')} style={{ fontSize: '14px' }}>
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
            />
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  )
}
