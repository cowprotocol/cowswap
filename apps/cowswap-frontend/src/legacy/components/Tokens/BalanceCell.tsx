import { useTheme } from '@cowswap/common-hooks'
import { TokenAmount } from '@cowswap/ui'
import { Loader } from '@cowswap/ui'
import { useWalletInfo } from '@cowswap/wallet'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'

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
