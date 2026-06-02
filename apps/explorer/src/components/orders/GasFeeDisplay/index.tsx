import React, { useMemo } from 'react'

import { AddressKey, areAddressesEqual, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Media } from '@cowprotocol/ui'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { WRAPPED_NATIVE_ADDRESS } from 'const'
import { useMultipleErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { Network } from 'types'
import { isNativeToken } from 'utils'

import { Order, ProtocolFee, ProtocolFeeType } from 'api/operator'
import { formatTokenAmount } from 'utils/tokenFormatting'

const PROTOCOL_FEE_LABELS: Record<ProtocolFeeType, string> = {
  [ProtocolFeeType.Surplus]: 'Surplus fee',
  [ProtocolFeeType.Volume]: 'Volume fee',
  [ProtocolFeeType.PriceImprovement]: 'Price improvement fee',
  [ProtocolFeeType.Unknown]: 'Protocol fee',
}

const FeesTable = styled.div`
  display: flex;
  margin: 0.5rem 0;
  border-radius: 0.6rem;
  line-height: 1.6;
  width: max-content;
  align-items: flex-start;
  word-break: break-all;
  overflow: auto;
  border: 1px solid rgb(151 151 184 / 10%);
  background: rgb(151 151 184 / 10%);

  ${Media.upToSmall()} {
    width: 100%;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td {
    padding: 0.1rem 0.5rem;
  }

  tr:not(:last-child) td {
    border-bottom: 1px solid rgb(151 151 184 / 15%);
  }
`

export type Props = { order: Order }

export function GasFeeDisplay(props: Props): React.ReactNode | null {
  const { order } = props
  const { protocolFees } = order

  const networkId = useNetworkId() ?? undefined

  const feeTokenAddresses = useMemo(() => (protocolFees ?? []).map((fee) => fee.tokenAddress), [protocolFees])
  const { value: feeTokens } = useMultipleErc20({ networkId, addresses: feeTokenAddresses })
  const feeTokensByKey = useMemo(() => {
    const map = new Map<AddressKey, TokenErc20>()
    Object.values(feeTokens).forEach((token) => {
      if (token) map.set(getAddressKey(token.address), token)
    })
    return map
  }, [feeTokens])

  if (!protocolFees || protocolFees.length === 0) {
    return <span>-</span>
  }

  return (
    <FeesTable>
      <table>
        <tbody>
          {protocolFees.map((fee, index) => (
            <tr key={`${fee.tokenAddress}-${index}`}>
              <td>{PROTOCOL_FEE_LABELS[fee.type]}:</td>
              <td>{formatFee(order, fee, feeTokensByKey, networkId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </FeesTable>
  )
}

function formatFee(
  order: Order,
  fee: ProtocolFee,
  feeTokensByKey: Map<AddressKey, TokenErc20>,
  networkId: Network | undefined,
): string {
  const { amount, tokenAddress } = fee
  const token = resolveToken(order, tokenAddress, feeTokensByKey, networkId)
  if (!token) return `${amount.toString(10)} ${tokenAddress}`
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
  return feeTokensByKey.get(getAddressKey(address)) || undefined
}
