import { EvmChains, isEvmChain, TargetChainId } from '@cowprotocol/cow-sdk'

import { useLingui } from '@lingui/react/macro'

import { AddressValidationStrategy } from 'common/utils/addressValidation/addressValidationStrategy'

const ENS_SUPPORTED_CHAINS = new Set<EvmChains>([EvmChains.MAINNET, EvmChains.SEPOLIA])

export function useReceiverPlaceholder(
  strategy: AddressValidationStrategy,
  networkLabel: string | undefined,
  targetChainId: TargetChainId | undefined,
  isBridging: boolean,
): string {
  const { t } = useLingui()

  if (strategy.placeholderKey === 'bitcoin') return t`Bitcoin address (bc1…, 1…, 3…)`
  if (strategy.placeholderKey === 'solana') return t`${networkLabel} address`

  const isEnsSupportedByChain = !!targetChainId && isEvmChain(targetChainId) && ENS_SUPPORTED_CHAINS.has(targetChainId)
  // bridge providers don't support ens
  const showEns = !isBridging && isEnsSupportedByChain
  return showEns ? t`Wallet Address or ENS name` : t`Wallet address`
}
