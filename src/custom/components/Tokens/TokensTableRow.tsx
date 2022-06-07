import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { RowFixed } from 'components/Row'
import useTheme from 'hooks/useTheme'
import {
  TokenText,
  ResponsiveGrid,
  Label,
  LargeOnly,
  HideLarge,
  ResponsiveLogo,
  IndexNumber,
  BalanceValue,
  Cell,
  TableButton,
} from './styled'
import FavouriteTokenButton from './FavouriteTokenButton'
import { TableType } from './TokensTable'
import { formatSmart } from 'utils/format'

type DataRowParams = {
  tokenData: Token
  index: number
  tableType?: TableType
  balance?: CurrencyAmount<Token> | undefined
  handleBuy: (token: Token) => void
  handleSell: (token: Token) => void
}

const DataRow = ({ tokenData, index, balance, handleBuy, handleSell }: DataRowParams) => {
  const theme = useTheme()
  const hasBalance = balance?.greaterThan(0)
  const formattedBalance = formatSmart(balance) || 0

  return (
    <ResponsiveGrid>
      <Cell>
        <FavouriteTokenButton tokenData={tokenData} />
        <IndexNumber>{index + 1}</IndexNumber>
      </Cell>

      <Cell>
        <RowFixed>
          <ResponsiveLogo currency={tokenData} />
        </RowFixed>

        <TokenText>
          <LargeOnly style={{ marginLeft: '10px' }}>
            <Label>{tokenData.symbol}</Label>
          </LargeOnly>

          <HideLarge style={{ marginLeft: '10px' }}>
            <RowFixed>
              <Label fontWeight={400} ml="8px" color={theme.text1}>
                {tokenData.name}
              </Label>
              <Label ml="8px" color={theme.primary5}>
                ({tokenData.symbol})
              </Label>
            </RowFixed>
          </HideLarge>
        </TokenText>
      </Cell>

      <Cell>
        <BalanceValue title={balance?.toExact()} hasBalance={!!hasBalance}>
          {formattedBalance}
        </BalanceValue>
      </Cell>

      <Cell>
        <TableButton onClick={() => handleBuy(tokenData)} color={theme.green1}>
          Buy
        </TableButton>
      </Cell>

      <Cell>
        <TableButton onClick={() => handleSell(tokenData)} color={theme.red1}>
          Sell
        </TableButton>
      </Cell>
    </ResponsiveGrid>
  )
}

export default DataRow
