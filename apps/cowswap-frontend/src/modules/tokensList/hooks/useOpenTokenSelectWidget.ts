import { useCallback } from 'react'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { isEvmChain } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { Field } from 'legacy/state/types'

import { TradeType, useTradeTypeInfo } from 'modules/trade'
import { useTradeTypeInfoFromUrl } from 'modules/trade/hooks/useTradeTypeInfoFromUrl'

import { CrossChainFamilySwitchState, useCrossChainFamilySwitch } from 'common/hooks/useCrossChainFamilySwitch'

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
  const tradeTypeInfoFromState = useTradeTypeInfo()
  const tradeTypeInfoFromUrl = useTradeTypeInfoFromUrl()
  const crossChainFamilySwitch = useCrossChainFamilySwitch()
  const tradeTypeInfo = tradeTypeInfoFromState ?? tradeTypeInfoFromUrl
  const tradeType = tradeTypeInfo?.tradeType
  // Advanced trades lock the target chain so price guarantees stay valid while the widget is open.
  const shouldLockTargetChain = tradeType === TradeType.LIMIT_ORDER || tradeType === TradeType.ADVANCED_ORDERS

  return useCallback(
    (selectedToken, field, oppositeToken, onSelectToken) => {
      const isOutputField = field === Field.OUTPUT
      const nextSelectedTargetChainId =
        isOutputField && selectedToken && isBridgingEnabled && !shouldLockTargetChain
          ? selectedToken.chainId
          : undefined

      updateSelectTokenWidget({
        selectedToken,
        field,
        oppositeToken,
        open: true,
        forceOpen: false,
        selectedTargetChainId: nextSelectedTargetChainId,
        tradeType,
        onSelectToken: async (currency) => {
          if (selectedToken) {
            const isSelectedTokenEvm = isEvmChain(selectedToken.chainId)
            const isNewTokenEvm = isEvmChain(currency.chainId)
            const shouldConfirmNetworkSwitch =
              (isSelectedTokenEvm && !isNewTokenEvm) || (!isSelectedTokenEvm && isNewTokenEvm)

            const crossChainSwitched =
              (await crossChainFamilySwitch(currency.chainId)) === CrossChainFamilySwitchState.FINISHED

            /**
             * In case of switching from EVM to non-EVM (and vice versa)
             * Ask a confirmation from the user
             * Because it requires connecting to another wallet
             */
            if (shouldConfirmNetworkSwitch && !crossChainSwitched) {
              return
            }
          }

          // Keep selector UX consistent with #6251: always close after a selection, even if a chain switch follows.
          closeTokenSelectWidget({ overrideForceLock: true })
          onSelectToken(currency)
        },
      })
    },
    [
      closeTokenSelectWidget,
      updateSelectTokenWidget,
      crossChainFamilySwitch,
      isBridgingEnabled,
      shouldLockTargetChain,
      tradeType,
    ],
  )
}
