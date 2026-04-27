import { ReactElement, ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { getBlockExplorerUrl as getExplorerLink } from '@cowprotocol/common-utils'
import { TargetChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink, RowBetween } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans, useLingui } from '@lingui/react/macro'

import { AutoColumn } from 'legacy/components/Column'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useAddressResolution } from './hooks/useAddressResolution'
import { useOnAddressInput } from './hooks/useOnAddressInput'
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
  const { handleInput, chainPrefixWarning } = useOnAddressInput(onChange, addressPrefix, strategy)
  const isDarkMode = useIsDarkMode()

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
              pattern={strategy.pattern}
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
