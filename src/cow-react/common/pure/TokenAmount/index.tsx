import { formatTokenAmount } from '@cow/utils/amountFormat'
import { FractionLike, Nullish } from '@cow/types'
import { TokenSymbol, TokenSymbolProps } from '@cow/common/pure/TokenSymbol'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { LONG_PRECISION } from 'constants/index'

export interface TokenAmountProps {
  amount: Nullish<FractionLike>
  defaultValue?: string
  tokenSymbol?: TokenSymbolProps['token']
  className?: string
}

// TODO: remove after testing
const highlight = !!localStorage.getItem('amountsRefactoring')

export function TokenAmount({ amount, defaultValue, className, tokenSymbol }: TokenAmountProps) {
  const title =
    FractionUtils.fractionLikeToExact(amount, LONG_PRECISION) + (tokenSymbol ? ` ${tokenSymbol.symbol}` : '')

  return (
    <>
      <span title={title} className={className} style={{ background: highlight ? 'rgba(196,18,255,0.4)' : '' }}>
        {formatTokenAmount(amount) || defaultValue}
        {tokenSymbol ? ' ' : ''}
        {tokenSymbol ? <TokenSymbol token={tokenSymbol} /> : ''}
      </span>
    </>
  )
}
