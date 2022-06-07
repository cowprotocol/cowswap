import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { RowFixed } from 'components/Row'
import useTheme from 'hooks/useTheme'
import {
  LinkWrapper,
  ResponsiveGrid,
  Label,
  MediumOnly,
  HideMedium,
  ResponsiveLogo,
  IndexNumber,
  BalanceValue,
} from './styled'
import FavouriteTokenButton from './FavouriteTokenButton'
import { TableType } from './TokensTable'
import { formatSmart } from 'utils/format'

type DataRowParams = {
  tokenData: Token
  index: number
  tableType?: TableType
  balance?: CurrencyAmount<Token> | undefined
}

const DataRow = ({ tokenData, index, balance }: DataRowParams) => {
  const theme = useTheme()
  const hasBalance = balance?.greaterThan(0)
  const formattedBalance = formatSmart(balance) || 0

  return (
    <ResponsiveGrid>
      <Label>
        <FavouriteTokenButton tokenData={tokenData} />
        <IndexNumber>{index + 1}</IndexNumber>
      </Label>

      <Label>
        <RowFixed>
          <ResponsiveLogo currency={tokenData} />
        </RowFixed>

        <LinkWrapper to={'tokens/' + tokenData.address}>
          <MediumOnly style={{ marginLeft: '6px' }}>
            <Label ml="8px">{tokenData.symbol}</Label>
          </MediumOnly>

          <HideMedium style={{ marginLeft: '10px' }}>
            <RowFixed>
              <Label ml="8px" color={theme.text1}>
                {tokenData.name}
              </Label>
              <Label ml="8px" color={theme.primary5}>
                ({tokenData.symbol})
              </Label>
            </RowFixed>
          </HideMedium>
        </LinkWrapper>
      </Label>

      <BalanceValue title={balance?.toExact()} hasBalance={!!hasBalance}>
        {formattedBalance}
      </BalanceValue>
    </ResponsiveGrid>
  )
}

export default DataRow
