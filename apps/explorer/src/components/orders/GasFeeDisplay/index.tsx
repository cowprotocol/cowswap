import React, { useMemo } from 'react'

import { AddressKey, getAddressKey } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'
import { NATIVE_TOKEN_ADDRESS, NATIVE_TOKEN_PER_NETWORK, ZERO_BIG_NUMBER } from 'const'
import { useMultipleErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { abbreviateString } from 'utils'

import { Order, ProtocolFee, ProtocolFeeType } from 'api/operator'
import { formatTokenAmount } from 'utils/tokenFormatting'

// The API says how each fee was calculated but not who charged it, so labels describe the policy
// instead of guessing at "protocol" vs "partner".
const FEE_TYPE_LABELS: Record<ProtocolFeeType, string> = {
  [ProtocolFeeType.Surplus]: 'Surplus fee',
  [ProtocolFeeType.Volume]: 'Volume fee',
  [ProtocolFeeType.PriceImprovement]: 'Price improvement fee',
  [ProtocolFeeType.Unknown]: 'Fee',
}

const LegacyWrapper = styled.div`
  > span {
    margin: 0 0.5rem 0 0;
  }
`

export type Props = {
  order: Order
  /** Gated by `isExplorerFeeDisplayEnabled`, which the caller reads. */
  showBreakdown?: boolean
}

type LineItem = { label: string; tokenAddress: AddressKey; amount: BigNumber }

export function GasFeeDisplay(props: Props): React.ReactNode | null {
  const { order, showBreakdown = false } = props

  // The total needs both the gas cost and the fees. Without either, fall back to the legacy
  // combined fee rather than showing a total that silently omits a component.
  if (!showBreakdown || !order.gasCost || !order.gasCost.isGreaterThan(0) || !order.protocolFees) {
    return <LegacyFeeDisplay order={order} />
  }

  return <CostsAndFeesBreakdown order={order} gasCost={order.gasCost} protocolFees={order.protocolFees} />
}

function CostsAndFeesBreakdown({
  order,
  gasCost,
  protocolFees,
}: {
  order: Order
  gasCost: BigNumber
  protocolFees: ProtocolFee[]
}): React.ReactNode {
  const networkId = useNetworkId() ?? undefined

  const feeTokenAddresses = useMemo(() => protocolFees.map((fee) => fee.tokenAddress), [protocolFees])
  const { value: feeTokens, isLoading: areFeeTokensLoading } = useMultipleErc20({
    networkId,
    addresses: feeTokenAddresses,
  })

  const nativeToken = networkId
    ? NATIVE_TOKEN_PER_NETWORK[networkId as keyof typeof NATIVE_TOKEN_PER_NETWORK]
    : undefined
  const nativeKey = getAddressKey(nativeToken?.address ?? NATIVE_TOKEN_ADDRESS)

  const tokenByKey = useMemo(() => {
    const map = new Map<AddressKey, TokenErc20>()
    for (const token of [...Object.values(feeTokens), nativeToken, order.buyToken, order.sellToken]) {
      if (token) map.set(getAddressKey(token.address), token)
    }
    return map
  }, [feeTokens, nativeToken, order.buyToken, order.sellToken])

  // Network costs first, then the fees in the order they were applied. Repeated types get numbered.
  const lineItems = useMemo<LineItem[]>(() => {
    const labels = protocolFees.map((fee) => FEE_TYPE_LABELS[fee.type])
    const occurrences = new Map<string, number>()
    const numbered = new Map<string, number>()

    for (const label of labels) occurrences.set(label, (occurrences.get(label) ?? 0) + 1)

    const feeItems = protocolFees.map(({ tokenAddress, amount }, index) => {
      const label = labels[index]
      const seen = (numbered.get(label) ?? 0) + 1
      numbered.set(label, seen)

      return { label: occurrences.get(label) === 1 ? label : `${label} (${seen})`, tokenAddress, amount }
    })

    return [{ label: 'Network costs', tokenAddress: nativeKey, amount: gasCost }, ...feeItems]
  }, [protocolFees, gasCost, nativeKey])

  // One total per token. Wrapped native is deliberately not folded into native — to the user those
  // are different assets, and folding them made the headline disagree with the rows below it.
  const totals = useMemo(() => {
    const byToken = new Map<AddressKey, BigNumber>()
    for (const { tokenAddress, amount } of lineItems) {
      byToken.set(tokenAddress, (byToken.get(tokenAddress) ?? ZERO_BIG_NUMBER).plus(amount))
    }
    return Array.from(byToken, ([key, amount]) => formatAmount(amount, tokenByKey.get(key), key)).join(', ')
  }, [lineItems, tokenByKey])

  // Amounts mean nothing without decimals; wait rather than flash unscaled numbers.
  if (areFeeTokensLoading) return null

  return (
    <>
      <span>{totals}</span>
      {/* A lone network-costs row would just repeat the total. */}
      {lineItems.length > 1 && (
        <NumbersBreakdown>
          <table>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.label}:</td>
                  <td>{formatAmount(item.amount, tokenByKey.get(item.tokenAddress), item.tokenAddress)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </NumbersBreakdown>
      )}
    </>
  )
}

// No metadata means no decimals, so mark the figure unscaled rather than pass it off as an amount.
function formatAmount(amount: BigNumber, token: TokenErc20 | undefined, tokenAddress: AddressKey): string {
  if (!token) return `${amount.toString(10)} (raw) ${abbreviateString(tokenAddress, 6, 4)}`

  const { formattedAmount, symbol } = formatTokenAmount(amount, token)
  return `${formattedAmount} ${symbol}`
}

// The combined executed fee in the sell token, shown whenever the breakdown can't be.
function LegacyFeeDisplay({ order }: { order: Order }): React.ReactNode {
  const { feeAmount, sellToken, sellTokenAddress, fullyFilled, totalFee } = order

  const { executedFeeFormatted, totalFeeFormatted, quoteSymbol } = useMemo(() => {
    if (!sellToken) {
      return {
        executedFeeFormatted: totalFee.toString(10),
        totalFeeFormatted: feeAmount.toString(10),
        quoteSymbol: sellTokenAddress,
      }
    }

    const { formattedAmount: executedFeeFormatted } = formatTokenAmount(totalFee, sellToken)
    const { formattedAmount: totalFeeFormatted, symbol: quoteSymbol } = formatTokenAmount(feeAmount, sellToken)

    return { executedFeeFormatted, totalFeeFormatted, quoteSymbol }
  }, [totalFee, feeAmount, sellToken, sellTokenAddress])

  const noFee = feeAmount.isZero() && totalFee.isZero()

  return (
    <LegacyWrapper>
      <span>
        {noFee ? '-' : `${executedFeeFormatted} ${quoteSymbol}`}
        {!fullyFilled && feeAmount.gt(ZERO_BIG_NUMBER) && (
          <span>
            {' '}
            of {totalFeeFormatted} {quoteSymbol}
          </span>
        )}
      </span>
    </LegacyWrapper>
  )
}
