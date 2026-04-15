import { BaseChainInfo, getChainInfo } from '@cowprotocol/common-const'
import { isEvmChain, TargetChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { AddressValidationStrategy, getAddressValidationStrategy } from '../../../utils/addressValidation'

export interface ReceiverChainInfo {
  chainId: TargetChainId
  chainInfo: BaseChainInfo
  isNonEvm: boolean
  chainIcon: string | undefined
  strategy: AddressValidationStrategy
}

export function useReceiverChainInfo(targetChainId?: TargetChainId): ReceiverChainInfo {
  const { chainId: walletChainId } = useWalletInfo()
  const chainId = (targetChainId ?? walletChainId) as TargetChainId
  const strategy = getAddressValidationStrategy(targetChainId)
  const chainInfo = getChainInfo(chainId)
  const isDarkMode = useIsDarkMode()
  const isNonEvm = targetChainId !== undefined && !isEvmChain(targetChainId)
  const chainIcon = isNonEvm ? (isDarkMode ? chainInfo?.logo?.dark : chainInfo?.logo?.light) : undefined

  return { chainId, chainInfo, isNonEvm, chainIcon, strategy }
}
