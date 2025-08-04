import { ChangeEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { getBlockExplorerUrl as getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'
import { ExternalLink, RowBetween } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t, Trans } from '@lingui/macro'

import { AutoColumn } from 'legacy/components/Column'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { InputPanel, ContainerRow, InputContainer, Input, ErrorMessage } from './styled'
import { shouldResolveENS, createValidationResult, processInputValue } from './utils'

import { autofocus } from '../../utils/autofocus'
import ChainPrefixWarning from '../ChainPrefixWarning'

interface AddressInputPanelProps {
  id?: string
  className?: string
  label?: ReactNode
  placeholder?: string
  value: string
  onChange: (value: string) => void
  customValidation?: (address: string) => string | null
  currentChainId?: SupportedChainId
  destinationChainId?: SupportedChainId
}

export function AddressInputPanel({
  id,
  className = 'recipient-address-input',
  label,
  placeholder,
  value,
  onChange,
  customValidation,
  currentChainId,
  destinationChainId,
}: AddressInputPanelProps): ReactNode {
  const { chainId } = useWalletInfo()
  const chainInfo = getChainInfo(chainId)
  const addressPrefix = chainInfo?.addressPrefix
  const isDarkMode = useIsDarkMode()
  const [chainPrefixWarning, setChainPrefixWarning] = useState('')

  // Determine effective chains
  const effectiveCurrentChain = currentChainId || chainId
  const effectiveDestinationChain = destinationChainId || effectiveCurrentChain

  // Only resolve ENS when BOTH chains are MAINNET
  const shouldResolve = shouldResolveENS(effectiveCurrentChain, effectiveDestinationChain)

  // Only call useENS when we should resolve
  const { address, loading, name } = useENS(shouldResolve ? value : null)

  const validationResult = useMemo(() => {
    return createValidationResult(value, shouldResolve, address, loading, customValidation)
  }, [value, shouldResolve, address, loading, customValidation])

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      processInputValue(event.target.value, addressPrefix, setChainPrefixWarning, onChange)
    },
    [onChange, addressPrefix],
  )

  // clear warning if chainId changes and we are now on the right network
  useEffect(() => {
    if (chainPrefixWarning && chainPrefixWarning === addressPrefix) {
      setChainPrefixWarning('')
    }
  }, [chainId, chainPrefixWarning, addressPrefix])

  return (
    <InputPanel id={id}>
      {chainPrefixWarning && (
        <ChainPrefixWarning chainPrefixWarning={chainPrefixWarning} chainInfo={chainInfo} isDarkMode={isDarkMode} />
      )}
      <ContainerRow error={validationResult.hasError}>
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
              error={validationResult.hasError}
              pattern="^(0x[a-fA-F0-9]{40})$"
              onChange={handleInput}
              value={value}
              onFocus={autofocus}
            />
            {(validationResult.ensError || validationResult.customError) && (
              <ErrorMessage>{validationResult.ensError || validationResult.customError}</ErrorMessage>
            )}
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  )
}
