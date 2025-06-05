import { OrderClass, OrderKind, OrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'

import { USDT, WETH } from './erc20s'

import { Order, RawOrder, RawTrade, OrderStatus as OrderStatusInner } from '../../api/operator'
import { ZERO_BIG_NUMBER } from '../../const'

export const RAW_ORDER = {
  creationDate: '2021-01-20T23:15:07.892538607Z',
  owner: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
  receiver: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
  uid: '0xadef89adea9e8d7f987e98f79a87efde5f7e65df65e76d5f67e5d76f5edf',
  partiallyFillable: false,
  invalidated: false,
  signingScheme: SigningScheme.EIP712,
  class: OrderClass.MARKET,
  buyAmount: '0',
  executedBuyAmount: '0',
  sellAmount: '0',
  executedSellAmount: '0',
  feeAmount: '0',
  executedFeeAmount: '0',
  executedFee: '0',
  executedSellAmountBeforeFees: '0',
  totalFee: '0',
  sellToken: WETH.address,
  buyToken: USDT.address,
  validTo: 0,
  appData: '0',
  kind: OrderKind.SELL,
  signature:
    '0x04dca25f59e9ac744c4093530a38f1719c4e0b1ce8e4b68c8018b6b05fd4a6944e1dcf2a009df2d5932f7c034b4a24da0999f9309dd5108d51d54236b605ed991c',
  status: OrderStatus.OPEN,
} as RawOrder

export const RICH_ORDER: Order = {
  ...RAW_ORDER,
  receiver: RAW_ORDER.owner,
  creationDate: new Date(RAW_ORDER.creationDate),
  expirationDate: new Date(RAW_ORDER.validTo * 1000),
  buyTokenAddress: RAW_ORDER.buyToken,
  sellTokenAddress: RAW_ORDER.sellToken,
  buyAmount: new BigNumber(RAW_ORDER.buyAmount),
  sellAmount: new BigNumber(RAW_ORDER.sellAmount),
  executedBuyAmount: ZERO_BIG_NUMBER,
  executedSellAmount: ZERO_BIG_NUMBER,
  feeAmount: new BigNumber(RAW_ORDER.feeAmount),
  executedFeeAmount: new BigNumber(RAW_ORDER.executedFeeAmount),
  executedFee: ZERO_BIG_NUMBER,
  totalFee: ZERO_BIG_NUMBER,
  cancelled: RAW_ORDER.invalidated,
  status: OrderStatusInner.Open,
  partiallyFilled: false,
  fullyFilled: false,
  filledAmount: ZERO_BIG_NUMBER,
  filledPercentage: ZERO_BIG_NUMBER,
  buyToken: USDT,
  sellToken: WETH,
  surplusAmount: ZERO_BIG_NUMBER,
  surplusPercentage: ZERO_BIG_NUMBER,
}

export const RAW_TRADE: RawTrade = {
  blockNumber: 8453440,
  logIndex: 3,
  orderUid:
    '0x9754ac5510f5057c71e7da67c63edfb2258c608e26f102418e15fef6110c61595b0abe214ab7875562adee331deff0fe1912fe42608087c7',
  buyAmount: '50000000000000000',
  sellAmount: '455756789061273449606',
  sellAmountBeforeFees: '454756979170023164166',
  owner: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
  buyToken: '0xc778417e063141139fce010982780140aa0cd5ab',
  sellToken: '0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02',
  txHash: '0x2ebf2ba8c2a568af0b11d2498648d6fec01db11e81c6e4bc5dbba9237472dce9',
}
