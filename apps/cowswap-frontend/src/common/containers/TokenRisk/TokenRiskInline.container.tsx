import { ReactNode, useId, useState } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency } from '@cowprotocol/currency'
import { useAcknowledgedWarningCodes, useTokenWarnings } from '@cowprotocol/tokens'

import { Trans } from '@lingui/react/macro'
import { Nullish } from 'types'

import { TokenRiskDetails, TokenRiskQuietLine } from 'common/pure/TokenRisk'

export interface TokenRiskInlineProps {
  currency: Nullish<Currency>
}

/**
 * Quiet risk line under a currency card, with the details opening in place below it.
 */
export function TokenRiskInline({ currency }: TokenRiskInlineProps): ReactNode {
  const { warnings, seriousWarnings, updatedAt } = useTokenWarnings(currency)
  const acknowledgedCodes = useAcknowledgedWarningCodes(currency)
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()

  if (!warnings.length || !currency || getIsNativeToken(currency)) return null

  const symbol = currency.symbol ?? currency.address

  const isConfirmed =
    seriousWarnings.length > 0 && seriousWarnings.every((warning) => acknowledgedCodes.includes(warning.code))

  return (
    <>
      <TokenRiskQuietLine
        warnings={warnings}
        isOpen={isOpen}
        panelId={panelId}
        onToggle={() => setIsOpen((wasOpen) => !wasOpen)}
      />
      {isOpen && (
        <div id={panelId}>
          <TokenRiskDetails
            warnings={warnings}
            symbol={symbol}
            address={currency.address}
            updatedAt={updatedAt}
            acknowledgedNote={
              isConfirmed ? <Trans>You confirmed the serious risks when you imported {symbol}.</Trans> : undefined
            }
          />
        </div>
      )}
    </>
  )
}
