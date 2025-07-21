import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import {
  getBlockExplorerUrl as getExplorerLink,
  isPrefixedAddress,
  parsePrefixedAddress,
} from '@cowprotocol/common-utils'
import { useENS } from '@cowprotocol/ens'
import { ExternalLink, RowBetween, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t, Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { autofocus } from '../../utils/autofocus'
import ChainPrefixWarning from '../ChainPrefixWarning'

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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
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
  const chainInfo = getChainInfo(chainId)
  const addressPrefix = chainInfo?.addressPrefix
  const { address, loading, name } = useENS(value)
  const [chainPrefixWarning, setChainPrefixWarning] = useState('')
  const isDarkMode = useIsDarkMode()

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setChainPrefixWarning('')
      let value = input.replace(/\s+/g, '')

      if (isPrefixedAddress(value)) {
        const { prefix, address } = parsePrefixedAddress(value)

        if (prefix && addressPrefix !== prefix) {
          setChainPrefixWarning(prefix)
        }

        if (address) {
          value = address
        }
      }

      onChange(value)
    },
    [onChange, addressPrefix],
  )

  // clear warning if chainId changes and we are now on the right network
  useEffect(() => {
    if (chainPrefixWarning && chainPrefixWarning === addressPrefix) {
      setChainPrefixWarning('')
    }
  }, [chainId, chainPrefixWarning, addressPrefix])

  const error = Boolean(value.length > 0 && !loading && !address)

  return (
    <InputPanel id={id}>
      {chainPrefixWarning && (
        <ChainPrefixWarning chainPrefixWarning={chainPrefixWarning} chainInfo={chainInfo} isDarkMode={isDarkMode} />
      )}
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
