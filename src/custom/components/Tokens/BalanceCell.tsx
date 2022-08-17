import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BalanceValue } from './styled'
import { formatSmart, formatMax } from 'utils/format'
import Loader from 'components/Loader'

type BalanceCellProps = {
  balance: CurrencyAmount<Token> | undefined
}

export default function BalanceCell({ balance }: BalanceCellProps) {
  const { account } = useWeb3React()
  const hasBalance = balance?.greaterThan(0)
  const formattedBalance = formatSmart(balance) || 0

  if (!balance) {
    return account ? <Loader /> : <BalanceValue hasBalance={false}>0</BalanceValue>
  }

  return (
    <BalanceValue title={formatMax(balance, balance.currency.decimals)} hasBalance={!!hasBalance}>
      <div>{formattedBalance}</div>
    </BalanceValue>
  )
}
