import { Token } from '@uniswap/sdk-core'
import { RowFixed } from 'components/Row'
import useTheme from 'hooks/useTheme'
import { LinkWrapper, ResponsiveGrid, Label, MediumOnly, HideMedium, ResponsiveLogo } from './styled'

const DataRow = ({ tokenData, index }: { tokenData: Token; index: number }) => {
  const theme = useTheme()
  return (
    <LinkWrapper to={'tokens/' + tokenData.address}>
      <ResponsiveGrid>
        <Label>{index + 1}</Label>
        <Label>
          <RowFixed>
            <ResponsiveLogo currency={tokenData} />
          </RowFixed>
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
        </Label>
      </ResponsiveGrid>
    </LinkWrapper>
  )
}

export default DataRow
