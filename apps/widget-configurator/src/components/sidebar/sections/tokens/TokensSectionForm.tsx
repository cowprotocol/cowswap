import type { Dispatch, ReactNode, SetStateAction } from 'react'

import type { TokenInfo } from '@cowprotocol/types'

import { TokenListControl } from '../../../controls/TokenListControl'
import { CurrencyInputControl } from '../../../ui/inputs/CurrencyInput/CurrencyInputControl'

import type { TokenListItem } from '../../../../configurator.types'
import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

function resolveNextState<T>(current: T, next: SetStateAction<T>): T {
  return typeof next === 'function' ? (next as (prevState: T) => T)(current) : next
}

interface TokensSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

export function TokensSectionForm({ values, onChange }: TokensSectionFormProps): ReactNode {
  const sellTokenState: [string, Dispatch<SetStateAction<string>>] = [
    values.sellToken,
    (nextValue) => onChange('sellToken', resolveNextState(values.sellToken, nextValue)),
  ]

  const sellTokenAmountState: [number, Dispatch<SetStateAction<number>>] = [
    values.sellTokenAmount,
    (nextValue) => onChange('sellTokenAmount', resolveNextState(values.sellTokenAmount, nextValue)),
  ]

  const buyTokenState: [string, Dispatch<SetStateAction<string>>] = [
    values.buyToken,
    (nextValue) => onChange('buyToken', resolveNextState(values.buyToken, nextValue)),
  ]

  const buyTokenAmountState: [number, Dispatch<SetStateAction<number>>] = [
    values.buyTokenAmount,
    (nextValue) => onChange('buyTokenAmount', resolveNextState(values.buyTokenAmount, nextValue)),
  ]

  const tokenListUrlsState: [TokenListItem[], Dispatch<SetStateAction<TokenListItem[]>>] = [
    values.tokenListUrls,
    (nextValue) => onChange('tokenListUrls', resolveNextState(values.tokenListUrls, nextValue)),
  ]

  const customTokensState: [TokenInfo[], Dispatch<SetStateAction<TokenInfo[]>>] = [
    values.customTokens,
    (nextValue) => onChange('customTokens', resolveNextState(values.customTokens, nextValue)),
  ]

  return (
    <>
      <CurrencyInputControl label="Sell token" tokenIdState={sellTokenState} tokenAmountState={sellTokenAmountState} />
      <CurrencyInputControl label="Buy token" tokenIdState={buyTokenState} tokenAmountState={buyTokenAmountState} />
      <TokenListControl tokenListUrlsState={tokenListUrlsState} customTokensState={customTokensState} />
    </>
  )
}
