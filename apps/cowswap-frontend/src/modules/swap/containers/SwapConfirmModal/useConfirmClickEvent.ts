import { useMemo } from 'react'

import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { buildSwapConfirmEvent } from './analytics'

export type ConfirmClickEventParams = {
  inputAmount: CurrencyAmount<Currency> | null
  outputAmount: CurrencyAmount<Currency> | null
  account: string | undefined
  ensName: string | undefined
  chainId: number | undefined
}

export function useConfirmClickEvent({
  inputAmount,
  outputAmount,
  account,
  ensName,
  chainId,
}: ConfirmClickEventParams): string | undefined {
  return useMemo(
    () =>
      buildSwapConfirmEvent({
        chainId,
        inputAmount,
        outputAmount,
        account,
        ensName,
      }),
    [chainId, inputAmount, outputAmount, account, ensName],
  )
}
