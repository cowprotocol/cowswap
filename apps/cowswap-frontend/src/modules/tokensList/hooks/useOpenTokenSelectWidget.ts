import { useCallback } from 'react'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Field } from 'legacy/state/types'

import { useTradeTypeInfo } from 'modules/trade/hooks/useTradeTypeInfo'
import { useTradeTypeInfoFromUrl } from 'modules/trade/hooks/useTradeTypeInfoFromUrl'
import { TradeType } from 'modules/trade/types'

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
        isAdvancedTradeType: shouldLockTargetChain,
        onSelectToken: (currency) => {
          // Keep selector UX consistent with #6251: always close after a selection, even if a chain switch follows.
          closeTokenSelectWidget({ overrideForceLock: true })
          onSelectToken(currency)
        },
      })
    },
    [closeTokenSelectWidget, updateSelectTokenWidget, isBridgingEnabled, shouldLockTargetChain],
  )
}
