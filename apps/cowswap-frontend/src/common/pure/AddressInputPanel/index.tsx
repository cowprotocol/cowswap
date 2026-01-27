/* eslint-disable complexity */
import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import {
  getBlockExplorerUrl as getExplorerLink,
  isPrefixedAddress,
  parsePrefixedAddress,
} from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'
import { ExternalLink, RowBetween, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans, useLingui } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { getChainType } from 'common/chains/nonEvm'
import { getNonEvmAllowlist } from 'common/chains/nonEvmTokenAllowlist'

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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`

const ActionButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`

const MessageText = styled.div<{ $error?: boolean }>`
  margin-top: 6px;
  font-size: 13px;
  color: ${({ $error }) => ($error ? `var(${UI.COLOR_DANGER})` : 'inherit')};
  opacity: ${({ $error }) => ($error ? 1 : 0.8)};
`

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ChainIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex: 0 0 auto;
`

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function AddressInputPanel({
  id,
  className = 'recipient-address-input',
  label,
  placeholder,
  value,
  onChange,
  targetChainId,
  enableEns = true,
  disableExplorerLink = false,
  isValid,
  errorMessage,
  warningText,
  pattern,
}: {
  id?: string
  className?: string
  label?: ReactNode
  placeholder?: string
  value: string
  onChange: (value: string) => void
  targetChainId?: number
  enableEns?: boolean
  disableExplorerLink?: boolean
  isValid?: boolean
  errorMessage?: ReactNode
  warningText?: ReactNode
  pattern?: string
}) {
  const { t } = useLingui()
  const { chainId: walletChainId } = useWalletInfo()
  // Use targetChainId if provided (for cross-chain), otherwise fall back to wallet's chain
  const chainId = targetChainId ?? walletChainId
  const supportedChainId =
    typeof chainId === 'number' && chainId in SupportedChainId ? (chainId as SupportedChainId) : undefined
  const chainInfo = supportedChainId ? getChainInfo(supportedChainId) : undefined
  const chainType = getChainType(chainId)
  const nonEvmAllowlist = getNonEvmAllowlist(chainId)
  const nonEvmLogoUrl = nonEvmAllowlist?.tokens[0]?.logoUrl
  const enableEnsEffective = enableEns && chainType === 'evm'
  const addressPrefix = chainInfo?.addressPrefix
  const { address, loading, name } = useENS(enableEnsEffective ? value : '')
  const [chainPrefixWarning, setChainPrefixWarning] = useState('')
  const isDarkMode = useIsDarkMode()

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setChainPrefixWarning('')
      let value = input.replace(/\s+/g, '')

      if (isPrefixedAddress(value)) {
        const { prefix, address } = parsePrefixedAddress(value)

        // Only show prefix warnings when we know the expected prefix for the current chain
        if (prefix && addressPrefix && addressPrefix !== prefix) {
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

  const handlePaste = useCallback(async () => {
    if (!navigator?.clipboard?.readText) return

    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        onChange(text.trim())
      }
    } catch (error) {
      console.debug('[AddressInputPanel] Failed to read clipboard', error)
    }
  }, [onChange])

  const handleClear = useCallback(() => onChange(''), [onChange])

  //clear warning if target chainId changes and we are now on the right network
  useEffect(() => {
    if (chainPrefixWarning && chainPrefixWarning === addressPrefix) {
      setChainPrefixWarning('')
    }
  }, [chainPrefixWarning, addressPrefix])

  const defaultError = Boolean(enableEnsEffective && value.length > 0 && !loading && !address)
  const error = typeof isValid === 'boolean' ? !isValid && (value.length > 0 || Boolean(errorMessage)) : defaultError
  const resolvedAddress = enableEnsEffective ? address : value
  const explorerAddress = name || resolvedAddress || undefined
  const canShowExplorerLink = Boolean(
    !disableExplorerLink && supportedChainId && resolvedAddress && (!enableEnsEffective || address),
  )
  const defaultLabelText = chainType === 'evm' ? t`Recipient` : t`Send to wallet`
  const defaultPlaceholderText = chainType === 'evm' ? t`Wallet Address or ENS name` : t`Enter wallet address`
  const showChainIconPrefix = chainType !== 'evm' && Boolean(nonEvmLogoUrl)

  return (
    <InputPanel id={id}>
      {chainPrefixWarning && chainInfo && (
        <ChainPrefixWarning chainPrefixWarning={chainPrefixWarning} chainInfo={chainInfo} isDarkMode={isDarkMode} />
      )}
      <ContainerRow error={error}>
        <InputContainer>
          <AutoColumn gap="md">
            <RowBetween>
              <span>{label ?? defaultLabelText}</span>
              <HeaderActions>
                {canShowExplorerLink && supportedChainId && explorerAddress && (
                  <ExternalLink
                    href={getExplorerLink(supportedChainId, 'address', explorerAddress)}
                    style={{ fontSize: '13px' }}
                  >
                    <Trans>(View on Explorer)</Trans>
                  </ExternalLink>
                )}
                <ActionButton type="button" onClick={handlePaste}>
                  <Trans>Paste</Trans>
                </ActionButton>
                {value && (
                  <ActionButton type="button" onClick={handleClear}>
                    <Trans>Clear</Trans>
                  </ActionButton>
                )}
              </HeaderActions>
            </RowBetween>
            <InputRow>
              {showChainIconPrefix && nonEvmLogoUrl && (
                <ChainIcon src={nonEvmLogoUrl} alt={`${chainType} icon`} aria-hidden="true" />
              )}
              <Input
                className={className}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder={placeholder ?? defaultPlaceholderText}
                error={error}
                pattern={pattern ?? (enableEnsEffective ? '^(0x[a-fA-F0-9]{40})$' : undefined)}
                onChange={handleInput}
                value={value}
                onFocus={autofocus}
              />
            </InputRow>
            {error && errorMessage && <MessageText $error>{errorMessage}</MessageText>}
            {!error && warningText && <MessageText>{warningText}</MessageText>}
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  )
}
