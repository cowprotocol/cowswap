import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { useActiveWeb3React } from 'hooks/web3'
import { BalanceValue } from './styled'
import { formatSmart } from 'utils/format'
import Loader from 'components/Loader'

type BalanceCellProps = {
  balance: CurrencyAmount<Token> | undefined
}

export default function BalanceCell({ balance }: BalanceCellProps) {
  const { account } = useActiveWeb3React()
  const hasBalance = balance?.greaterThan(0)
  const formattedBalance = formatSmart(balance) || 0

  if (!balance) {
    return account ? <Loader /> : <BalanceValue hasBalance={false}>0</BalanceValue>
  }

  return (
    <BalanceValue title={balance?.toExact()} hasBalance={!!hasBalance}>
      <div>{formattedBalance}</div>
    </BalanceValue>
  )
}
