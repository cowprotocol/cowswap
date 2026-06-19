import React, { useMemo } from 'react'

import { AddressKey, areAddressesEqual, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'
import { NATIVE_TOKEN_ADDRESS, NATIVE_TOKEN_PER_NETWORK, WRAPPED_NATIVE_ADDRESS, ZERO_BIG_NUMBER } from 'const'
import { useMultipleErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { Network } from 'types'
import { abbreviateString, isNativeToken } from 'utils'

import { Order, ProtocolFeeType } from 'api/operator'
import { formatTokenAmount } from 'utils/tokenFormatting'

// Label for the protocol's own fee (the first fee applied). The protocol takes a volume fee
// (2 / 0.3 bps) on most orders, surfaced simply as "Protocol fee"; for orders where it instead
// takes a surplus / price-improvement fee we keep the descriptive label.
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
  const { protocolFees } = order
  const networkId = useNetworkId() ?? undefined

  const feeTokenAddresses = useMemo(() => (protocolFees ?? []).map((fee) => fee.tokenAddress), [protocolFees])
  const { value: feeTokens } = useMultipleErc20({ networkId, addresses: feeTokenAddresses })

  const nativeToken = networkId
    ? NATIVE_TOKEN_PER_NETWORK[networkId as keyof typeof NATIVE_TOKEN_PER_NETWORK]
    : undefined

  const feeTokensByKey = useMemo(() => {
    const map = new Map<AddressKey, TokenErc20>()
    Object.values(feeTokens).forEach((token) => {
      if (token) map.set(getAddressKey(token.address), token)
    })
    // Network costs are denominated in the native token, so make it resolvable too.
    if (nativeToken) map.set(getAddressKey(nativeToken.address), nativeToken)
    return map
  }, [feeTokens, nativeToken])

  // One row per cost/fee, in display order: network costs first, then the protocol fee (the fee
  // applied first), then the partner fees that follow it — each partner numbered so an order with
  // several partner fees (e.g. two distinct partners) can be told apart.
  const lineItems = useMemo<LineItem[]>(() => {
    const nativeKey = getAddressKey(nativeToken?.address ?? NATIVE_TOKEN_ADDRESS)
    const items: LineItem[] = [{ label: 'Network costs', tokenAddress: nativeKey, amount: gasCost }]

    let partnerNumber = 0
    for (const fee of protocolFees ?? []) {
      // The first applied fee (position 0) is the protocol's own; the fees after it are partner fees.
      const isProtocolFee = fee.position === 0
      const label = isProtocolFee ? PROTOCOL_FEE_LABELS[fee.type] : getPartnerFeeLabel(fee.type, ++partnerNumber)
      items.push({ label, tokenAddress: fee.tokenAddress, amount: fee.amount })
    }
    return items
  }, [protocolFees, gasCost, nativeToken])

  // Headline total per token (rows in the same token are summed), shown above the breakdown.
  const totalsByToken = useMemo(() => {
    const map = new Map<AddressKey, BigNumber>()
    for (const item of lineItems) {
      const current = map.get(item.tokenAddress)
      map.set(item.tokenAddress, current ? current.plus(item.amount) : item.amount)
    }
    return map
  }, [lineItems])

  const total = Array.from(totalsByToken, ([tokenAddress, amount]) =>
    formatAmount(order, amount, tokenAddress, feeTokensByKey, networkId),
  ).join(', ')

  return (
    <>
      <span>{total}</span>
      <NumbersBreakdown>
        <table>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={`${item.label}-${index}`}>
                <td>{item.label}:</td>
                <td>{formatAmount(order, item.amount, item.tokenAddress, feeTokensByKey, networkId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </NumbersBreakdown>
    </>
  )
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

type LineItem = { label: string; tokenAddress: AddressKey; amount: BigNumber }

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

function formatAmount(
  order: Order,
  amount: BigNumber,
  tokenAddress: AddressKey,
  feeTokensByKey: Map<AddressKey, TokenErc20>,
  networkId: Network | undefined,
): string {
  const token = resolveToken(order, tokenAddress, feeTokensByKey, networkId)
  // Token metadata not loaded: we can't know decimals, so show the raw atom amount
  // alongside a shortened address rather than an unreadable 42-char string.
  if (!token) return `${amount.toString(10)} ${abbreviateString(tokenAddress, 6, 4)}`
  const { formattedAmount, symbol } = formatTokenAmount(amount, token)
  return `${formattedAmount} ${symbol}`
}

function resolveToken(
  order: Order,
  address: AddressKey,
  feeTokensByKey: Map<AddressKey, TokenErc20>,
  networkId: Network | undefined,
): TokenErc20 | undefined {
  if (areAddressesEqual(order.sellToken?.address, address)) return order.sellToken || undefined
  if (areAddressesEqual(order.buyToken?.address, address)) return order.buyToken || undefined
  // Ethflow orders sell native ETH but pay fees in the wrapped native (WETH) on-chain.
  // Display them as the native token to stay consistent with the rest of the order details.
  if (
    networkId &&
    isNativeToken(order.sellTokenAddress) &&
    areAddressesEqual(WRAPPED_NATIVE_ADDRESS[networkId as SupportedChainId], address)
  ) {
    return order.sellToken || undefined
  }
  return feeTokensByKey.get(address) || undefined
}
