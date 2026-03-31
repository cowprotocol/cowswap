import { ChangeEvent, ReactElement, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import {
  getBlockExplorerUrl as getExplorerLink,
  isPrefixedAddress,
  parsePrefixedAddress,
} from '@cowprotocol/common-utils'
import { TargetChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'
import { ExternalLink, RowBetween } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans, useLingui } from '@lingui/react/macro'

import { AutoColumn } from 'legacy/components/Column'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { ContainerRow, Input, InputContainer, InputPanel } from './styled'

import { getAddressValidationStrategy } from '../../utils/addressValidation'
import { autofocus } from '../../utils/autofocus'
import ChainPrefixWarning from '../ChainPrefixWarning'

export interface AddressInputPanelProps {
  id?: string
  className?: string
  label?: ReactNode
  placeholder?: string
  value: string
  onChange: (value: string) => void
  targetChainId?: TargetChainId
}

function useAddressResolution(
  value: string,
  targetChainId: TargetChainId | undefined,
): { address: string | null; loading: boolean; name: string | null } {
  const strategy = getAddressValidationStrategy(targetChainId)
  const { address: ensAddress, loading: ensLoading, name } = useENS(strategy.supportsENS ? value : undefined)

  return useMemo(() => {
    if (!strategy.supportsENS) {
      const isValid = value.length > 0 && strategy.isValidAddress(value)
      return { address: isValid ? value : null, loading: false, name: null }
    }
    return { address: ensAddress, loading: ensLoading, name }
  }, [strategy, value, ensAddress, ensLoading, name])
}

export function AddressInputPanel({
  id,
  className = 'recipient-address-input',
  label,
  placeholder,
  value,
  onChange,
  targetChainId,
}: AddressInputPanelProps): ReactElement {
  const { t } = useLingui()
  const { chainId: walletChainId } = useWalletInfo()
  const chainId = targetChainId ?? walletChainId
  const strategy = getAddressValidationStrategy(targetChainId)
  const chainInfo = getChainInfo(chainId)
  const addressPrefix = chainInfo?.addressPrefix
  const { address, loading, name } = useAddressResolution(value, targetChainId)
  const [chainPrefixWarning, setChainPrefixWarning] = useState('')
  const isDarkMode = useIsDarkMode()

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setChainPrefixWarning('')
      let parsed = input.replace(/\s+/g, '')

      if (strategy.supportsChainPrefix && isPrefixedAddress(parsed)) {
        const { prefix, address: prefixedAddr } = parsePrefixedAddress(parsed)

        if (prefix && addressPrefix !== prefix) {
          setChainPrefixWarning(prefix)
        }

        if (prefixedAddr) {
          parsed = prefixedAddr
        }
      }

      onChange(parsed)
    },
    [onChange, addressPrefix, strategy],
  )

  useEffect(() => {
    if (chainPrefixWarning && chainPrefixWarning === addressPrefix) {
      setChainPrefixWarning('')
    }
  }, [chainPrefixWarning, addressPrefix])

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
              {address && chainId && strategy.supportsENS && (
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
              placeholder={
                placeholder ??
                (strategy.placeholderKey === 'nonEvm' ? t`Recipient address` : t`Wallet Address or ENS name`)
              }
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
