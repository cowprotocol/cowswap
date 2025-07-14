import { COW_TOKEN_TO_CHAIN, USDC } from '@cowprotocol/common-const'
import { OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

export const getOrderMock = (chainId: SupportedChainId): Order => {
  const inputToken = COW_TOKEN_TO_CHAIN[chainId]

  if (!inputToken) {
    throw new Error('Input token not found')
  }

  const outputToken = USDC[chainId]
  const creationTime = '2023-05-29T15:27:32.319Z'

  return {
    inputToken,
    outputToken,
    sellToken: inputToken.address,
    buyToken: outputToken.address,
    sellAmount: '343543544323034',
    buyAmount: '234560250344324234',
    validTo: 1685374832,
    appData: '0xaa',
    feeAmount: '34665433',
    kind: OrderKind.SELL,
    partiallyFillable: false,
    id: '0x62baf4be8adec4766d26a2169999cc170c3ead90ae11a28d658e6d75edc05b185b0abe214ab7875562adee331deff0fe1912fe42644d2bb7',
    owner: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
    summary: 'Summary',
    class: OrderClass.LIMIT,
    status: OrderStatus.PENDING,
    creationTime,
    isCancelling: false,
    isUnfillable: false,
    fulfillmentTime: '',
    fulfilledTransactionHash: '',
    sellAmountBeforeFee: 10000,
    signature: '0xsss',
    signingScheme: SigningScheme.EIP712,
  }
}
