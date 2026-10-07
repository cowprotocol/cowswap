import { Fragment, ReactNode } from 'react'

import { safeShortenAddress } from '@cowprotocol/common-utils'
import { AddressKey, areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'
import { safeFromRawAmount, Token } from '@cowprotocol/currency'
import { HoverTooltip, TokenAmount } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'

import * as styledEl from './CostsAndFeesBreakdown.styled'

import type { OrderCostsAndFees } from '../../types/orderCostsAndFees.types'

export interface CostsAndFeesBreakdownProps {
  costs: OrderCostsAndFees
  tokens: Token[]
}

interface ApproximateAmountProps {
  amount: bigint
  token: Token
  isApproximate: boolean
  tooltip: ReactNode
}

interface CostAmountProps {
  amount: bigint
  tokenAddress: AddressKey
  token?: Token
}

export function CostsAndFeesBreakdown({ costs, tokens }: CostsAndFeesBreakdownProps): ReactNode {
  const { i18n } = useLingui()
  const tokenByKey = new Map([costs.nativeToken, ...tokens].map((token) => [getAddressKey(token.address), token]))
  const { surplusCosts } = costs
  const nativeKey = getAddressKey(costs.nativeToken.address)
  const symbol = surplusCosts?.token.symbol
  const nativeItem = costs.lineItems.find((item) => areAddressesEqual(item.tokenAddress, nativeKey))

  const tooltip = surplusCosts && nativeItem && (
    <Trans>
      Paid <CostAmount amount={nativeItem.amount} tokenAddress={nativeKey} token={costs.nativeToken} /> in network
      costs. Shown in {symbol} at the current price.
    </Trans>
  )

  return (
    <>
      <styledEl.Totals>
        {surplusCosts ? (
          <ApproximateAmount
            amount={surplusCosts.total}
            token={surplusCosts.token}
            isApproximate={surplusCosts.isApproximate}
            tooltip={tooltip}
          />
        ) : (
          costs.totals.map(([tokenAddress, amount], index) => (
            <Fragment key={tokenAddress}>
              {index > 0 && ', '}
              <CostAmount amount={amount} tokenAddress={tokenAddress} token={tokenByKey.get(tokenAddress)} />
            </Fragment>
          ))
        )}
      </styledEl.Totals>
      {costs.lineItems.length > 1 && (
        <styledEl.Details>
          <summary>
            <Trans>Show more</Trans>
          </summary>
          <styledEl.Table>
            <tbody>
              {costs.lineItems.map((item, index) => {
                const converted = surplusCosts?.items[index]

                return (
                  <tr key={index}>
                    <td>
                      {i18n._(item.label)}
                      {item.occurrence ? ` (${item.occurrence})` : ''}
                    </td>
                    <td>
                      {surplusCosts && converted ? (
                        <ApproximateAmount
                          amount={converted.amount}
                          token={surplusCosts.token}
                          isApproximate={converted.isApproximate}
                          tooltip={tooltip}
                        />
                      ) : (
                        <CostAmount
                          amount={item.amount}
                          tokenAddress={item.tokenAddress}
                          token={tokenByKey.get(item.tokenAddress)}
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </styledEl.Table>
        </styledEl.Details>
      )}
    </>
  )
}

function ApproximateAmount({ amount, token, isApproximate, tooltip }: ApproximateAmountProps): ReactNode {
  const value = <CostAmount amount={amount} tokenAddress={getAddressKey(token.address)} token={token} />

  if (!isApproximate) return value

  return (
    <styledEl.Approximate>
      <HoverTooltip content={tooltip} wrapInContainer placement="top">
        ≈ {value}
      </HoverTooltip>
    </styledEl.Approximate>
  )
}

function CostAmount({ amount, tokenAddress, token }: CostAmountProps): ReactNode {
  const currencyAmount = token && safeFromRawAmount(token, amount)

  // Without metadata, or with an amount too large to represent (bad API data), the figure is
  // shown unscaled and marked as such instead of crashing the render.
  if (!currencyAmount) return `${amount.toString()} (raw) ${safeShortenAddress(tokenAddress)}`

  return <TokenAmount amount={currencyAmount} tokenSymbol={token} />
}
