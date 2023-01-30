import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BalanceValue } from './styled'
import { formatSmart, formatMax } from '@cow/utils/format'
import Loader from 'components/Loader'
import useTheme from 'hooks/useTheme'

type BalanceCellProps = {
  balance: CurrencyAmount<Token> | undefined
}

export default function BalanceCell({ balance }: BalanceCellProps) {
  const { account } = useWeb3React()
  const hasBalance = balance?.greaterThan(0)
  const formattedBalance = formatSmart(balance) || 0
  const theme = useTheme()

  if (!balance) {
    return account ? <Loader stroke={theme.text3} /> : <BalanceValue hasBalance={false}>0</BalanceValue>
  }

  return (
    <BalanceValue title={formatMax(balance, balance.currency.decimals)} hasBalance={!!hasBalance}>
      {formattedBalance}
    </BalanceValue>
  )
}
