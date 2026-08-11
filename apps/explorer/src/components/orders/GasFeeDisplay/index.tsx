import { Fragment, ReactNode, useMemo } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { AddressKey, getAddressKey } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'
import { TokenAmount } from 'components/token/TokenAmount'
import { NATIVE_TOKEN_ADDRESS, NATIVE_TOKEN_PER_NETWORK, ZERO_BIG_NUMBER } from 'const'
import { useMultipleErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'

import { Order, ProtocolFee, ProtocolFeeType } from 'api/operator'
import { formatTokenAmount } from 'utils/tokenFormatting'

// The API says how each fee was calculated but not who charged it, so labels name the policy.
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
  /** The caller gates this on `isExplorerFeeDisplayEnabled` plus a usable gas cost and fee list. */
  showBreakdown?: boolean
}

type LineItem = { label: string; tokenAddress: AddressKey; amount: BigNumber }

export function GasFeeDisplay(props: Props): ReactNode {
  const { order, showBreakdown = false } = props

  // Without both the gas cost and the fees, a total would silently omit a component.
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
}): ReactNode {
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

  // One total per token; wrapped native deliberately stays separate from native.
  const totals = useMemo(() => {
    const byToken = new Map<AddressKey, BigNumber>()
    for (const { tokenAddress, amount } of lineItems) {
      byToken.set(tokenAddress, (byToken.get(tokenAddress) ?? ZERO_BIG_NUMBER).plus(amount))
    }
    return Array.from(byToken)
  }, [lineItems])

  // Amounts mean nothing without decimals; keep the legacy fee up until they load.
  if (areFeeTokensLoading) return <LegacyFeeDisplay order={order} />

  return (
    <>
      <span>
        {totals.map(([tokenAddress, amount], index) => (
          <Fragment key={tokenAddress}>
            {index > 0 && ', '}
            <FeeAmount amount={amount} token={tokenByKey.get(tokenAddress)} tokenAddress={tokenAddress} />
          </Fragment>
        ))}
      </span>
      {/* A lone network-costs row would just repeat the total. */}
      {lineItems.length > 1 && (
        <NumbersBreakdown>
          <table>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.label}:</td>
                  <td>
                    <FeeAmount
                      amount={item.amount}
                      token={tokenByKey.get(item.tokenAddress)}
                      tokenAddress={item.tokenAddress}
                    />
                  </td>
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
function FeeAmount({
  amount,
  token,
  tokenAddress,
}: {
  amount: BigNumber
  token?: TokenErc20
  tokenAddress: AddressKey
}): ReactNode {
  if (!token) return `${amount.toString(10)} (raw) ${shortenAddress(tokenAddress)}`

  return <TokenAmount amount={amount} token={token} />
}

// The combined executed fee in the sell token, shown whenever the breakdown can't be.
function LegacyFeeDisplay({ order }: { order: Order }): ReactNode {
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
