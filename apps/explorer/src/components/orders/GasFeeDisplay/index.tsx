import React, { useMemo } from 'react'

import { AddressKey, areAddressesEqual, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { NumbersBreakdown } from 'components/orders/NumbersBreakdown'
import { WRAPPED_NATIVE_ADDRESS, ZERO_BIG_NUMBER } from 'const'
import { useMultipleErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { Network } from 'types'
import { isNativeToken } from 'utils'

import { Order } from 'api/operator'
import { formatTokenAmount } from 'utils/tokenFormatting'

const Wrapper = styled.div`
  > span {
    margin: 0 0.5rem 0 0;
  }
`

export type Props = { order: Order }

export function GasFeeDisplay(props: Props): React.ReactNode | null {
  const { order } = props
  const {
    feeAmount,
    sellToken,
    sellTokenAddress,
    fullyFilled,
    totalFee,
    networkCosts,
    protocolFees,
    protocolFeeTokenAddress,
    executedFeeToken,
  } = order

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

  const noFee = useMemo(() => feeAmount.isZero() && totalFee.isZero(), [feeAmount, totalFee])

  const FeeElement = useMemo(
    () => (
      <span>
        {noFee ? '-' : `${executedFeeFormatted} ${quoteSymbol}`}
        {!fullyFilled && feeAmount.gt(ZERO_BIG_NUMBER) && (
          <>
            <span>
              of {totalFeeFormatted} {quoteSymbol}
            </span>
          </>
        )}
      </span>
    ),
    [noFee, executedFeeFormatted, quoteSymbol, fullyFilled, feeAmount, totalFeeFormatted],
  )

  const executedFeeTokenKey = executedFeeToken ? getAddressKey(executedFeeToken) : undefined
  const sameDenomination = areAddressesEqual(executedFeeTokenKey, protocolFeeTokenAddress)

  // Network costs and protocol fees can be denominated in tokens other than the order's
  // sell/buy token (e.g. WETH network costs on an ethflow order), so resolve them explicitly.
  const networkId = useNetworkId() ?? undefined
  const feeTokenAddresses = useMemo(
    () => [executedFeeTokenKey, protocolFeeTokenAddress].filter((address): address is AddressKey => Boolean(address)),
    [executedFeeTokenKey, protocolFeeTokenAddress],
  )
  const { value: feeTokens } = useMultipleErc20({ networkId, addresses: feeTokenAddresses })
  const feeTokensByKey = useMemo(() => {
    const map = new Map<AddressKey, TokenErc20>()
    Object.values(feeTokens).forEach((token) => {
      if (token) map.set(getAddressKey(token.address), token)
    })
    return map
  }, [feeTokens])

  return (
    <Wrapper>
      {FeeElement}
      {networkCosts && protocolFees && (
        <NumbersBreakdown>
          <table>
            <tbody>
              <tr>
                <td>Network Costs:</td>
                <td>{formatFee(order, networkCosts, executedFeeTokenKey, feeTokensByKey, networkId)}</td>
              </tr>
              <tr>
                <td>Fee:</td>
                <td>{formatFee(order, protocolFees, protocolFeeTokenAddress, feeTokensByKey, networkId)}</td>
              </tr>
              {sameDenomination && (
                <tr>
                  <td>Total Costs &amp; Fees:</td>
                  <td>
                    {executedFeeFormatted} {quoteSymbol}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </NumbersBreakdown>
      )}
    </Wrapper>
  )
}

function formatFee(
  order: Order,
  amount: BigNumber,
  address: AddressKey | undefined,
  feeTokensByKey: Map<AddressKey, TokenErc20>,
  networkId: Network | undefined,
): string {
  const token = resolveToken(order, address, feeTokensByKey, networkId)
  if (!token) return address ? `${amount.toString(10)} ${address}` : amount.toString(10)
  const { formattedAmount, symbol } = formatTokenAmount(amount, token)
  return `${formattedAmount} ${symbol}`
}

function resolveToken(
  order: Order,
  address: AddressKey | undefined,
  feeTokensByKey: Map<AddressKey, TokenErc20>,
  networkId: Network | undefined,
): TokenErc20 | undefined {
  if (!address) return order.sellToken || undefined
  if (areAddressesEqual(order.sellToken?.address, address)) return order.sellToken || undefined
  if (areAddressesEqual(order.buyToken?.address, address)) return order.buyToken || undefined
  // Ethflow orders sell native ETH but pay network costs in the wrapped native (WETH) on-chain.
  // Display them as the native token to stay consistent with the rest of the order details.
  if (
    networkId &&
    isNativeToken(order.sellTokenAddress) &&
    areAddressesEqual(WRAPPED_NATIVE_ADDRESS[networkId as SupportedChainId], address)
  ) {
    return order.sellToken || undefined
  }
  return feeTokensByKey.get(getAddressKey(address)) || undefined
}
