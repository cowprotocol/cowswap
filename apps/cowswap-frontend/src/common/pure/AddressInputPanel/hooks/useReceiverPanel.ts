import { ChangeEvent, useCallback, useState } from 'react'

import { BaseChainInfo, getChainInfo } from '@cowprotocol/common-const'
import { getBlockExplorerUrl } from '@cowprotocol/common-utils'
import { isEvmChain, TargetChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useAddressResolution } from './useAddressResolution'
import { useOnAddressInput } from './useOnAddressInput'

import { AddressValidationStrategy, getAddressValidationStrategy } from '../../../utils/addressValidation'

function getChainIcon(isNonEvm: boolean, isDarkMode: boolean, chainInfo: BaseChainInfo): string | undefined {
  if (!isNonEvm) return undefined
  return isDarkMode ? chainInfo?.logo?.dark : chainInfo?.logo?.light
}

function getExplorerUrl(
  isValid: boolean,
  isNonEvm: boolean,
  strategy: AddressValidationStrategy,
  chainId: TargetChainId,
  name: string | null,
  address: string | null,
): string | null {
  if (!isValid || isNonEvm || !strategy.supportsENS) return null
  return getBlockExplorerUrl(chainId, 'address', name ?? address ?? '')
}

interface UseReceiverPanelInput {
  value: string
  onChange(value: string): void
  targetChainId?: TargetChainId
}

export interface UseReceiverPanelResult {
  chainInfo: BaseChainInfo
  strategy: AddressValidationStrategy
  chainPrefixWarning: string
  isDarkMode: boolean
  showQrModal: boolean
  setShowQrModal(v: boolean): void
  isEmpty: boolean
  isValid: boolean
  isError: boolean
  isNonEvm: boolean
  chainIcon: string | undefined
  explorerUrl: string | null
  handleInput(e: ChangeEvent<HTMLInputElement>): void
  handlePaste(): void
  handleClear(): void
  handleScan(result: string): void
  loading: boolean
}

export function useReceiverPanel({ value, onChange, targetChainId }: UseReceiverPanelInput): UseReceiverPanelResult {
  const { chainId: walletChainId } = useWalletInfo()
  const chainId = targetChainId ?? walletChainId
  const strategy = getAddressValidationStrategy(targetChainId)
  const chainInfo = getChainInfo(chainId)
  const { address, loading, name } = useAddressResolution(value, targetChainId)
  const { handleInput, chainPrefixWarning } = useOnAddressInput(onChange, chainInfo?.addressPrefix, strategy)
  const isDarkMode = useIsDarkMode()
  const [showQrModal, setShowQrModal] = useState(false)

  const isEmpty = value.length === 0
  const isNonEvm = targetChainId !== undefined && !isEvmChain(targetChainId)
  const isValid = Boolean(address)
  const isError = !isEmpty && !loading && !isValid

  const handlePaste = useCallback(() => {
    navigator.clipboard.readText().then(onChange)
  }, [onChange])

  const handleClear = useCallback(() => onChange(''), [onChange])

  const handleScan = useCallback(
    (result: string) => {
      onChange(result)
      setShowQrModal(false)
    },
    [onChange, setShowQrModal],
  )

  return {
    chainInfo,
    strategy,
    chainPrefixWarning,
    isDarkMode,
    showQrModal,
    setShowQrModal,
    isEmpty,
    isValid,
    isError,
    isNonEvm,
    chainIcon: getChainIcon(isNonEvm, isDarkMode, chainInfo),
    explorerUrl: getExplorerUrl(isValid, isNonEvm, strategy, chainId, name, address),
    handleInput,
    handlePaste,
    handleClear,
    handleScan,
    loading,
  }
}
