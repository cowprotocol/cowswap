import { Token } from '@uniswap/sdk-core'
import { RowFixed } from 'components/Row'
import useTheme from 'hooks/useTheme'
import { LinkWrapper, ResponsiveGrid, Label, MediumOnly, HideMedium, ResponsiveLogo, IndexNumber } from './styled'
import FavouriteTokenButton from './FavouriteTokenButton'
import { TableType } from './TokensTable'

type DataRowParams = {
  tokenData: Token
  index: number
  tableType?: TableType
}

const DataRow = ({ tokenData, index }: DataRowParams) => {
  const theme = useTheme()

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
    </ResponsiveGrid>
  )
}

export default DataRow
