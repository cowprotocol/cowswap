import { Dispatch, SetStateAction, useMemo, useState } from 'react'

import { TokenListCategory } from '@cowprotocol/tokens'

import { t } from '@lingui/core/macro'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade'

import { getDefaultTokenListCategories } from '../getDefaultTokenListCategories'

export type TokenListCategoryState = [TokenListCategory[] | null, Dispatch<SetStateAction<TokenListCategory[] | null>>]

export interface WidgetMetadata {
  disableErc20: boolean
  tokenListCategoryState: TokenListCategoryState
  modalTitle: string
  chainsPanelTitle: string
}

export function useWidgetMetadata(
  field: Field,
  tradeType: TradeType | undefined,
  displayLpTokenLists: boolean | undefined,
  oppositeToken: Parameters<typeof getDefaultTokenListCategories>[1],
  lpTokensWithBalancesCount: number,
): WidgetMetadata {
  const disableErc20 = field === Field.OUTPUT && !!displayLpTokenLists
  const tokenListCategoryState: TokenListCategoryState = useState<TokenListCategory[] | null>(
    getDefaultTokenListCategories(field, oppositeToken, lpTokensWithBalancesCount),
  )
  const modalTitle = resolveModalTitle(field, tradeType)
  const chainsPanelTitle =
    field === Field.INPUT ? t`From network` : field === Field.OUTPUT ? t`To network` : t`Select network`

  return useMemo(
    () => ({ disableErc20, tokenListCategoryState, modalTitle, chainsPanelTitle }),
    [disableErc20, tokenListCategoryState, modalTitle, chainsPanelTitle],
  )
}

export function resolveModalTitle(field: Field, tradeType: TradeType | undefined): string {
  const isSwapTrade = !tradeType || tradeType === TradeType.SWAP

  if (field === Field.INPUT) {
    return isSwapTrade ? t`Swap from` : t`Sell token`
  }

  if (field === Field.OUTPUT) {
    return isSwapTrade ? t`Swap to` : t`Buy token`
  }

  return t`Select token`
}
