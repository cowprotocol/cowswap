import { Token, CurrencyAmount } from '@uniswap/sdk-core'

import Loader from 'legacy/components/Loader'
import useTheme from 'legacy/hooks/useTheme'

import { useWalletInfo } from 'modules/wallet'

import { TokenAmount } from 'common/pure/TokenAmount'

import { BalanceValue } from './styled'

type BalanceCellProps = {
  balance: CurrencyAmount<Token> | undefined
}

export default function BalanceCell({ balance }: BalanceCellProps) {
  const { account } = useWalletInfo()
  const hasBalance = balance?.greaterThan(0)
  const theme = useTheme()

  if (!balance) {
    return account ? <Loader stroke={theme.text3} /> : <BalanceValue hasBalance={false}>0</BalanceValue>
  }

  return (
    <BalanceValue hasBalance={!!hasBalance}>
      <TokenAmount amount={balance} />
    </BalanceValue>
  )
}
