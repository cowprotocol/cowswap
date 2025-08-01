import { useCallback } from 'react'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { useWalletChainId } from '@cowprotocol/wallet-provider'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Field } from 'legacy/state/types'

import { useCloseTokenSelectWidget } from './useCloseTokenSelectWidget'
import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

export function useOpenTokenSelectWidget(): (
  selectedToken: Nullish<Currency>,
  field: Field | undefined,
  oppositeToken: TokenWithLogo | LpToken | Currency | undefined,
  onSelectToken: (currency: Currency) => void,
) => void {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const isBridgingEnabled = useIsBridgingEnabled()
  const walletChainId = useWalletChainId()

  return useCallback(
    (selectedToken, field, oppositeToken, onSelectToken) => {
      const isOutputField = field === Field.OUTPUT
      const selectedTargetChainId =
        isOutputField && selectedToken && isBridgingEnabled ? selectedToken.chainId : undefined

      updateSelectTokenWidget({
        selectedToken,
        field,
        oppositeToken,
        open: true,
        selectedTargetChainId,
        onSelectToken: (currency) => {
          const withoutNetworkSwitch = selectedTargetChainId || walletChainId === currency.chainId || isOutputField
          if (withoutNetworkSwitch) {
            closeTokenSelectWidget()
          }
          onSelectToken(currency)
        },
      })
    },
    [closeTokenSelectWidget, updateSelectTokenWidget, isBridgingEnabled, walletChainId],
  )
}
