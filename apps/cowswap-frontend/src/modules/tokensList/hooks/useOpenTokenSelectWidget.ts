import { useCallback } from 'react'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade'

import { useCloseTokenSelectWidget } from './useCloseTokenSelectWidget'
import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

type OpenTokenSelectWidgetFn = (
  selectedToken: Nullish<Currency>,
  field: Field | undefined,
  oppositeToken: TokenWithLogo | LpToken | Currency | undefined,
  onSelectToken: (currency: Currency) => void,
  tradeType?: TradeType,
) => void

export function useOpenTokenSelectWidget(): OpenTokenSelectWidgetFn {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const isBridgingEnabled = useIsBridgingEnabled()

  return useCallback<OpenTokenSelectWidgetFn>(
    (selectedToken, field, oppositeToken, onSelectToken, tradeType) => {
      const isOutputField = field === Field.OUTPUT
      const selectedTargetChainId =
        isOutputField && selectedToken && isBridgingEnabled ? selectedToken.chainId : undefined

      updateSelectTokenWidget({
        selectedToken,
        field,
        oppositeToken,
        open: true,
        selectedTargetChainId,
        tradeType,
        onSelectToken: (currency) => {
          // Close the token selector regardless of network switching.
          // UX: When a user picks a token (even from another network),
          // the selector should close as per issue #6251 expected behavior.
          closeTokenSelectWidget()
          onSelectToken(currency)
        },
      })
    },
    [closeTokenSelectWidget, updateSelectTokenWidget, isBridgingEnabled],
  )
}
