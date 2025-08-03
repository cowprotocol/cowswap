import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import {
  getBlockExplorerUrl as getExplorerLink,
  isPrefixedAddress,
  parsePrefixedAddress,
} from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { RowBetween, NetworkLogo } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t, Trans } from '@lingui/macro'

import { AutoColumn } from 'legacy/components/Column'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { hasEnsEnding } from 'common/utils/ensUtils'

import { useEnhancedENS } from './hooks/useEnhancedENS'
import {
  InputPanel,
  ContainerRow,
  InputContainer,
  Input,
  DestinationChainInfo,
  ValidationError,
  StyledExplorerLink,
} from './styled'

import { autofocus } from '../../utils/autofocus'
import ChainPrefixWarning from '../ChainPrefixWarning'

function useInputHandler(
  onChange: (value: string) => void,
  addressPrefix: string | undefined,
  setChainPrefixWarning: (warning: string) => void,
): (event: ChangeEvent<HTMLInputElement>) => void {
  return useCallback(
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
    [onChange, addressPrefix, setChainPrefixWarning],
  )
}

function useCustomValidation(
  customValidation: ((address: string, ensName: string | null, chainId: number) => string | null) | undefined,
  debouncedValue: string,
  name: string | null,
  effectiveChainId: SupportedChainId,
): string | null {
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (customValidation && debouncedValue) {
      const error = customValidation(debouncedValue, name, effectiveChainId)
      setValidationError(error)
    } else {
      setValidationError(null)
    }
  }, [customValidation, debouncedValue, name, effectiveChainId])

  return validationError
}

// Error state calculation hook
function useErrorState(
  debouncedValue: string,
  loading: boolean,
  address: string | null,
  disableENS: boolean,
  ensChainValidationError: string | null,
  validationError: string | null,
): boolean {
  // For bridge transactions (disableENS=true), show error for debounced invalid addresses
  if (disableENS && debouncedValue.length > 0 && !loading && !address) {
    return true
  }

  // For regular transactions (disableENS=false), show error for debounced input that doesn't resolve
  if (!disableENS && debouncedValue.length > 0 && !loading && !address) {
    return true
  }

  // Also show ENS-specific validation errors
  return Boolean(ensChainValidationError) || Boolean(validationError)
}

// Explorer Link component
interface ExplorerLinkProps {
  address: string | null
  name: string | null
  effectiveChainId: SupportedChainId
}

function ExplorerLink({
  address,
  name,
  effectiveChainId,
  inputValue,
}: ExplorerLinkProps & { inputValue: string }): ReactNode {
  if (!address || !effectiveChainId) return null

  // Use what the user actually typed - if they typed an ENS name, use that; if they typed an address, use that
  const linkTarget = hasEnsEnding(inputValue) ? name || inputValue : address

  return (
    <StyledExplorerLink
      href={getExplorerLink(effectiveChainId, 'address', linkTarget)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Trans>View on Explorer ↗</Trans>
    </StyledExplorerLink>
  )
}

// Validation section component
interface ValidationSectionProps {
  showDestinationChain?: boolean
  destinationChainId?: SupportedChainId
  ensChainValidationError: string | null
  validationError: string | null
}

function ValidationSection({
  showDestinationChain,
  destinationChainId,
  ensChainValidationError,
  validationError,
}: ValidationSectionProps): ReactNode {
  return (
    <>
      {showDestinationChain && destinationChainId && (
        <DestinationChainInfo>
          <NetworkLogo chainId={destinationChainId} size={16} />
          <span>On {getChainInfo(destinationChainId)?.label}</span>
        </DestinationChainInfo>
      )}
      {ensChainValidationError && <ValidationError>{ensChainValidationError}</ValidationError>}
      {validationError && !ensChainValidationError && <ValidationError>{validationError}</ValidationError>}
    </>
  )
}

interface AddressInputPanelProps {
  id?: string
  className?: string
  label?: ReactNode
  placeholder?: string
  value: string
  onChange: (value: string) => void
  destinationChainId?: SupportedChainId
  showDestinationChain?: boolean
  customValidation?: (address: string, ensName: string | null, chainId: number) => string | null
  disableENS?: boolean // NEW: Disable ENS resolution for bridge transactions
}

// TODO: Break down this large function into smaller functions
export function AddressInputPanel({
  id,
  className = 'recipient-address-input',
  label,
  placeholder,
  value,
  onChange,
  destinationChainId,
  showDestinationChain = false,
  customValidation,
  disableENS = false,
}: AddressInputPanelProps): ReactNode {
  const { chainId } = useWalletInfo()
  const effectiveChainId = destinationChainId || chainId
  const chainInfo = getChainInfo(effectiveChainId)
  const addressPrefix = chainInfo?.addressPrefix
  const isDarkMode = useIsDarkMode()

  const [chainPrefixWarning, setChainPrefixWarning] = useState('')

  const { address, loading, name, ensChainValidationError, debouncedValue } = useEnhancedENS(
    value,
    disableENS,
    effectiveChainId,
  )

  const validationError = useCustomValidation(customValidation, debouncedValue, name, effectiveChainId)
  const error = useErrorState(debouncedValue, loading, address, disableENS, ensChainValidationError, validationError)
  const handleInput = useInputHandler(onChange, addressPrefix, setChainPrefixWarning)

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
      <ContainerRow error={error}>
        <InputContainer>
          <AutoColumn gap="md">
            <RowBetween>
              <span>{label ?? <Trans>Recipient</Trans>}</span>
              <ExplorerLink address={address} name={name} effectiveChainId={effectiveChainId} inputValue={value} />
            </RowBetween>
            <Input
              className={className}
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder={disableENS ? t`Recipient address` : (placeholder ?? t`Recipient address or ENS name`)}
              error={error}
              pattern="^(0x[a-fA-F0-9]{40})$"
              onChange={handleInput}
              value={value}
              onFocus={autofocus}
            />
            <ValidationSection
              showDestinationChain={showDestinationChain}
              destinationChainId={destinationChainId}
              ensChainValidationError={ensChainValidationError}
              validationError={validationError}
            />
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  )
}
