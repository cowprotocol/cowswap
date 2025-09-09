import { ReactNode, useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { useDerivedTradeState } from '../../../trade'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const CapitalizedFirst = styled.span`
  text-transform: capitalize;
`

export function SwapAmountPreview(): ReactNode {
  const { inputCurrency, outputCurrency, outputCurrencyAmount, inputCurrencyAmount } = useDerivedTradeState() || {}

  const inputToken = useMemo(() => (inputCurrency ? getWrappedToken(inputCurrency) : null), [inputCurrency])
  const outputToken = useMemo(() => (outputCurrency ? getWrappedToken(outputCurrency) : null), [outputCurrency])
  const dstNetworkName = useMemo(
    () => CHAIN_INFO[(outputToken?.chainId as SupportedChainId) || SupportedChainId.MAINNET]?.name,
    [outputToken],
  )

  return (
    <Wrapper>
      <TokenLogo size={16} token={inputToken} />
      <TokenAmount amount={inputCurrencyAmount} />
      {' → '}
      <TokenLogo size={16} token={outputToken} />
      <TokenAmount amount={outputCurrencyAmount} /> on <CapitalizedFirst>{dstNetworkName}</CapitalizedFirst>
    </Wrapper>
  )
}
