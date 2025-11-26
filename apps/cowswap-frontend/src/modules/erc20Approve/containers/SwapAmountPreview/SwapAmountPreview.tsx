import { ReactNode, useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useDerivedTradeState } from 'modules/trade'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  gap: 4px;
  padding: 0 10px;
`

const CapitalizedFirst = styled.span`
  text-transform: capitalize;
`

export function SwapAmountPreview(): ReactNode {
  const { inputCurrency, outputCurrency, outputCurrencyAmount, inputCurrencyAmount } = useDerivedTradeState() || {}

  const inputToken = useMemo(() => (inputCurrency ? getWrappedToken(inputCurrency) : null), [inputCurrency])
  const outputToken = useMemo(() => (outputCurrency ? getWrappedToken(outputCurrency) : null), [outputCurrency])
  const dstNetworkName = useMemo(
    () => CHAIN_INFO[(outputToken?.chainId as SupportedChainId) || SupportedChainId.MAINNET]?.label,
    [outputToken],
  )

  const srcNetworkName = useMemo(
    () => CHAIN_INFO[(inputToken?.chainId as SupportedChainId) || SupportedChainId.MAINNET]?.label,
    [inputToken],
  )

  return (
    <Wrapper>
      <TokenLogo size={16} token={inputToken} />
      <TokenAmount amount={inputCurrencyAmount} /> <Trans>on</Trans>{' '}
      <CapitalizedFirst>{srcNetworkName}</CapitalizedFirst>
      {' → '}
      <TokenLogo size={16} token={outputToken} />
      <TokenAmount amount={outputCurrencyAmount} /> <Trans>on</Trans>{' '}
      <CapitalizedFirst>{dstNetworkName}</CapitalizedFirst>
    </Wrapper>
  )
}
