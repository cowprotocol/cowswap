import { TxOptionalParams } from 'types'

import { RECEIPT } from '../test/data'

const wait = process.env.NODE_ENV === 'test' ? noop : waitImpl

export async function waitAndSendReceipt(params: {
  waitTime?: number
  waitTimeForReceipt?: number
  txOptionalParams?: TxOptionalParams
}): Promise<void> {
  const { waitTime = 2500, waitTimeForReceipt = 1000, txOptionalParams } = params
  if (txOptionalParams?.onSentTransaction) {
    await wait(waitTimeForReceipt)
    txOptionalParams.onSentTransaction(RECEIPT.transactionHash)
  }
  return wait(waitTime)
}

async function noop(_milliseconds = 0): Promise<void> {}

async function waitImpl(milliseconds = 2500): Promise<void> {
  return new Promise((resolve): void => {
    setTimeout((): void => {
      resolve()
    }, milliseconds)
  })
}
