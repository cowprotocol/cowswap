import type { TwapPartOrder } from '@cowprotocol/sdk-composable'

import { toTwapPartTableRow } from './toTwapPartTableRow'

const part: TwapPartOrder = {
  orderUid: 'part-id',
  status: 'unconfirmed',
  sellAmount: 123456789012345678901n,
  buyAmount: 100000000000000000001n,
  feeAmount: 1n,
  validTo: 2000,
  createdAt: 1000,
  executedSellAmount: null,
  executedBuyAmount: null,
  executedFeeAmount: null,
}

const schedule = { durationOfPart: 0, timeBetweenParts: 300 }

it('preserves raw precision and displays candidates as scheduled without inventing enrichment', () => {
  const row = toTwapPartTableRow(part, schedule)
  expect(row.sellAmount.toFixed()).toBe(part.sellAmount.toString())
  expect(row.buyAmount.toFixed()).toBe(part.buyAmount.toString())
  expect(row.sellAmount.plus(row.feeAmount).toFixed()).toBe('123456789012345678902')
  expect(row.creationDate.getTime()).toBe(1701000)
  expect(row.status).toBe('unconfirmed')
  expect(row.statusLabel).toBe('SCHEDULED')
  expect(row).not.toHaveProperty('surplusAmount')
  expect(row.executedSellAmount.isZero()).toBe(true)
})

it('preserves execution amounts and filled status for completed parts', () => {
  const row = toTwapPartTableRow(
    {
      ...part,
      status: 'fulfilled',
      executedSellAmount: part.sellAmount,
      executedBuyAmount: part.buyAmount,
    },
    schedule,
  )
  expect(row.status).toBe('filled')
  expect(row.statusLabel).toBeUndefined()
  expect(row.executedSellAmount.toFixed()).toBe(part.sellAmount.toString())
  expect(row.filledPercentage.toFixed()).toBe('100')
})
