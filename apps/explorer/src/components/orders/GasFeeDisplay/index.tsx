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

// The API reports how each fee was calculated but not who charged it, so the labels describe the
// policy rather than guessing at "protocol" vs "partner" — an order can carry a partner fee and no
// protocol fee, and attributing that to the protocol would be wrong.
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
  /**
   * Whether the costs & fees breakdown may be shown. Off by default: the feature is behind the
   * `isExplorerFeeDisplayEnabled` flag, read by the caller (see `CostAndFeesItem`).
   */
  showBreakdown?: boolean
}

type LineItem = { label: string; tokenAddress: AddressKey; amount: BigNumber }

export function GasFeeDisplay(props: Props): React.ReactNode | null {
  const { order, showBreakdown = false } = props

  // The breakdown needs both halves of the picture to add up: the gas cost, which is missing on
  // orders settled before the orderbook recorded it (and on ones not yet settled), and the protocol
  // fees, which are undefined until their fetch succeeds. Without either, showing a total would
  // mean quietly leaving a component out of it, so we fall back to the legacy display of the
  // combined executed fee, which is complete on its own terms.
  if (!showBreakdown || !order.gasCost || !order.gasCost.isGreaterThan(0) || !order.protocolFees) {
    return <LegacyFeeDisplay order={order} />
  }

  return <CostsAndFeesBreakdown order={order} gasCost={order.gasCost} protocolFees={order.protocolFees} />
}

/**
 * Breakdown of what the order cost to execute: a "Network costs" line (the on-chain execution cost,
 * in the native token) followed by one line per fee policy that charged something.
 */
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

  // Resolves every address in the breakdown to a token: the order's own tokens, the native token
  // (network costs) and the fetched fee-token metadata.
  const tokenByKey = useMemo(() => {
    const map = new Map<AddressKey, TokenErc20>()
    for (const token of [...Object.values(feeTokens), nativeToken, order.buyToken, order.sellToken]) {
      if (token) map.set(getAddressKey(token.address), token)
    }
    return map
  }, [feeTokens, nativeToken, order.buyToken, order.sellToken])

  // One row per cost: network costs first, then each fee in the order the policies were applied.
  // Policies of the same type are numbered so they can be told apart; a type that occurs once keeps
  // its plain label, which is the common case.
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

  // Headline total per token. Fees are charged in the surplus-side token, so an order can pay in
  // more than one; each keeps its own figure rather than being folded together, because the wrapped
  // native token and the native token the gas is paid in are not interchangeable to the user.
  const totals = useMemo(() => {
    const byToken = new Map<AddressKey, BigNumber>()
    for (const { tokenAddress, amount } of lineItems) {
      byToken.set(tokenAddress, (byToken.get(tokenAddress) ?? ZERO_BIG_NUMBER).plus(amount))
    }
    return Array.from(byToken, ([key, amount]) => formatAmount(amount, tokenByKey.get(key), key)).join(', ')
  }, [lineItems, tokenByKey])

  // Amounts are meaningless without the token's decimals, so wait for the metadata rather than
  // briefly rendering unscaled numbers that read as real amounts.
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

// Without token metadata we don't know the decimals, so there is no honest way to render the
// amount. Show the token it was charged in and mark the figure as unscaled rather than printing a
// bare number that looks like a real amount.
function formatAmount(amount: BigNumber, token: TokenErc20 | undefined, tokenAddress: AddressKey): string {
  if (!token) return `${amount.toString(10)} (raw) ${abbreviateString(tokenAddress, 6, 4)}`

  const { formattedAmount, symbol } = formatTokenAmount(amount, token)
  return `${formattedAmount} ${symbol}`
}

/**
 * Legacy display for orders without a recorded gas cost: the combined executed fee in the sell
 * token (network costs + protocol fees together), as it was shown before the breakdown existed.
 */
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
