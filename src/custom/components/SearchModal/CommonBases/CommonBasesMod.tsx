import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
// import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { AutoRow } from 'components/Row'
import { useTokenInfoFromActiveList } from 'hooks/useTokenInfoFromActiveList'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { currencyId } from 'utils/currencyId'

// MOD imports
import QuestionHelper from 'components/QuestionHelper'
import { BaseWrapper, CommonBasesRow, CommonBasesProps, MobileWrapper } from '.' // mod
import { useFavouriteOrCommonTokens } from 'hooks/useFavouriteOrCommonTokens'

/* const MobileWrapper = styled(AutoColumn)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
` */

export const BaseWrapperMod = styled.div<{ disable?: boolean }>`
  // mod
  border: 1px solid ${({ theme, disable }) => (disable ? 'transparent' : theme.bg3)};
  border-radius: 10px;
  display: flex;
  padding: 6px;

  align-items: center;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    background-color: ${({ theme, disable }) => !disable && theme.bg4};
  }

  color: ${({ theme, disable }) => disable && theme.text3};
  background-color: ${({ theme, disable }) => disable && theme.bg3};
  filter: ${({ disable }) => disable && 'grayscale(1)'};
`

const MAX_LENGTH_OVERFLOW = 12
export default function CommonBases({ chainId, onSelect, selectedCurrency }: CommonBasesProps) {
  /* {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
} */
  const tokens = useFavouriteOrCommonTokens()

  return tokens.length > 0 ? (
    <MobileWrapper gap="md" showOverflow={tokens.length > MAX_LENGTH_OVERFLOW}>
      <AutoRow>
        <Text fontWeight={500} fontSize={14}>
          {/* <Trans>Common bases</Trans> */}
          <Trans>Favourite tokens</Trans>
        </Text>
        <QuestionHelper text={<Trans>Your favourite saved tokens. Edit this list in your account page.</Trans>} />
      </AutoRow>
      <CommonBasesRow gap="4px">
        {tokens.map((currency: Currency) => {
          const isSelected = selectedCurrency?.equals(currency)
          return (
            <BaseWrapper
              onClick={() => !isSelected && onSelect(currency)}
              disable={isSelected}
              key={currencyId(currency)}
            >
              <CurrencyLogoFromList currency={currency} />
              <Text fontWeight={500} fontSize={16}>
                {currency.symbol}
              </Text>
            </BaseWrapper>
          )
        })}
      </CommonBasesRow>
    </MobileWrapper>
  ) : null
}

/** helper component to retrieve a base currency from the active token lists */
function CurrencyLogoFromList({ currency }: { currency: Currency }) {
  const token = useTokenInfoFromActiveList(currency)

  return <CurrencyLogo currency={token} style={{ marginRight: 8 }} />
}
