import React, { useMemo } from 'react'

import { AddressKey, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'
import { NATIVE_TOKEN_ADDRESS, NATIVE_TOKEN_PER_NETWORK, WRAPPED_NATIVE_ADDRESS, ZERO_BIG_NUMBER } from 'const'
import { useMultipleErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { abbreviateString, isNativeToken } from 'utils'

import { Order, ProtocolFeeType } from 'api/operator'
import { formatTokenAmount } from 'utils/tokenFormatting'

// Labels for the protocol's own fee (the first applied fee), by policy type. The common case is a
// plain volume fee, shown simply as "Protocol fee".
const PROTOCOL_FEE_LABELS: Record<ProtocolFeeType, string> = {
  [ProtocolFeeType.Surplus]: 'Surplus fee',
  [ProtocolFeeType.Volume]: 'Protocol fee',
  [ProtocolFeeType.PriceImprovement]: 'Price improvement fee',
  [ProtocolFeeType.Unknown]: 'Protocol fee',
}

const LegacyWrapper = styled.div`
  > span {
    margin: 0 0.5rem 0 0;
  }
`

export type Props = { order: Order }

type LineItem = { label: string; tokenAddress: AddressKey; amount: BigNumber }

export function GasFeeDisplay(props: Props): React.ReactNode | null {
  const { order } = props

  // Orders settled before the orderbook started recording gas costs (or not yet settled) have no
  // gasCost. Without it we can't split the executed fee into network costs + protocol/partner fees,
  // so we fall back to the legacy display that just shows the combined executed fee.
  if (!order.gasCost || !order.gasCost.isGreaterThan(0)) {
    return <LegacyFeeDisplay order={order} />
  }

  return <CostsAndFeesBreakdown order={order} gasCost={order.gasCost} />
}

/**
 * New breakdown shown once the order reports its gas cost: a "Network costs" line (the on-chain
 * execution cost, in the native token) followed by the protocol fee and any partner fees.
 */
function CostsAndFeesBreakdown({ order, gasCost }: { order: Order; gasCost: BigNumber }): React.ReactNode {
  const networkId = useNetworkId() ?? undefined
  const { protocolFees } = order

  const feeTokenAddresses = useMemo(() => (protocolFees ?? []).map((fee) => fee.tokenAddress), [protocolFees])
  const { value: feeTokens } = useMultipleErc20({ networkId, addresses: feeTokenAddresses })

  const nativeToken = networkId
    ? NATIVE_TOKEN_PER_NETWORK[networkId as keyof typeof NATIVE_TOKEN_PER_NETWORK]
    : undefined
  const nativeKey = getAddressKey(nativeToken?.address ?? NATIVE_TOKEN_ADDRESS)
  const wrappedKey =
    networkId !== undefined ? getAddressKey(WRAPPED_NATIVE_ADDRESS[networkId as SupportedChainId]) : undefined

  // Resolves every address in the breakdown to a token: the order's own tokens, the native token
  // (network costs) and the fetched fee-token metadata. Ethflow orders sell native ETH but pay fees
  // in wrapped native, so the wrapped address resolves to the (native) sell token.
  const tokenByKey = useMemo(() => {
    const map = new Map<AddressKey, TokenErc20>()
    const candidates = [...Object.values(feeTokens), nativeToken, order.buyToken, order.sellToken]
    for (const token of candidates) {
      if (token) map.set(getAddressKey(token.address), token)
    }
    if (wrappedKey && order.sellToken && isNativeToken(order.sellTokenAddress)) map.set(wrappedKey, order.sellToken)
    return map
  }, [feeTokens, nativeToken, order.buyToken, order.sellToken, order.sellTokenAddress, wrappedKey])

  // One row per cost/fee: network costs first, then the protocol fee (position 0), then the partner
  // fees that follow it (numbered so multiple partners can be told apart).
  const lineItems = useMemo<LineItem[]>(() => {
    const items: LineItem[] = [{ label: 'Network costs', tokenAddress: nativeKey, amount: gasCost }]
    let partnerNumber = 0
    for (const fee of protocolFees ?? []) {
      const label = fee.position === 0 ? PROTOCOL_FEE_LABELS[fee.type] : getPartnerFeeLabel(fee.type, ++partnerNumber)
      items.push({ label, tokenAddress: fee.tokenAddress, amount: fee.amount })
    }
    return items
  }, [protocolFees, gasCost, nativeKey])

  // Headline total per token. Network costs (native) and fees taken in wrapped native are the same
  // asset, so wrapped folds into native to show one figure; other tokens keep their own total.
  const total = useMemo(() => {
    const totals = new Map<AddressKey, BigNumber>()
    for (const { tokenAddress, amount } of lineItems) {
      const key = tokenAddress === wrappedKey ? nativeKey : tokenAddress
      totals.set(key, (totals.get(key) ?? ZERO_BIG_NUMBER).plus(amount))
    }
    return Array.from(totals, ([key, amount]) => formatAmount(amount, tokenByKey.get(key), key)).join(', ')
  }, [lineItems, wrappedKey, nativeKey, tokenByKey])

  return (
    <>
      <span>{total}</span>
      <NumbersBreakdown>
        <table>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={`${item.label}-${index}`}>
                <td>{item.label}:</td>
                <td>{formatAmount(item.amount, tokenByKey.get(item.tokenAddress), item.tokenAddress)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </NumbersBreakdown>
    </>
  )
}

// Without token metadata we can't know decimals, so show the raw atom amount alongside a shortened
// address rather than an unreadable 42-char string.
function formatAmount(amount: BigNumber, token: TokenErc20 | undefined, tokenAddress: AddressKey): string {
  if (!token) return `${amount.toString(10)} ${abbreviateString(tokenAddress, 6, 4)}`
  const { formattedAmount, symbol } = formatTokenAmount(amount, token)
  return `${formattedAmount} ${symbol}`
}

/**
 * Label for a partner fee. The trade API doesn't expose the partner's identity, so partners are
 * numbered by the order their fees were applied; a single partner with several fee types will show
 * as separate numbered entries.
 */
function getPartnerFeeLabel(type: ProtocolFeeType, partnerNumber: number): string {
  switch (type) {
    case ProtocolFeeType.Volume:
      return `Partner ${partnerNumber} volume fee`
    case ProtocolFeeType.PriceImprovement:
      return `Partner ${partnerNumber} price improvement share`
    case ProtocolFeeType.Surplus:
      return `Partner ${partnerNumber} surplus fee`
    default:
      return `Partner ${partnerNumber} fee`
  }
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
