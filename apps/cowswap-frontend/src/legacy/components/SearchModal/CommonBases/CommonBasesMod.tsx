import { currencyId } from '@cowprotocol/common-utils'
import { TokenSymbol, AutoRow } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import QuestionHelper from 'legacy/components/QuestionHelper'
import { useFavouriteOrCommonTokens } from 'legacy/hooks/useFavouriteOrCommonTokens'

import { CurrencyLogo } from 'common/pure/CurrencyLogo'

import { BaseWrapper, CommonBasesRow, MobileWrapper } from './index'

export const StyledScrollarea = styled.div`
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  padding: 0 20px 0;
  overflow-y: hidden;
  overflow-x: auto;
  ${({ theme }) => theme.colorScrollbar};
`

const MAX_LENGTH_OVERFLOW = 12
export default function CommonBases({
  onSelect,
  selectedCurrency,
}: {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
  searchQuery?: string
  isAddressSearch?: string | false
}) {
  const tokens = useFavouriteOrCommonTokens()

  return tokens.length > 0 ? (
    <MobileWrapper gap="md" showOverflow={tokens.length > MAX_LENGTH_OVERFLOW}>
      <AutoRow padding="0 20px">
        <Text fontWeight={500} fontSize={14}>
          <Trans>Favourite tokens</Trans>
        </Text>
        <QuestionHelper text={<Trans>Your favourite saved tokens. Edit this list in your account page.</Trans>} />
      </AutoRow>
      <StyledScrollarea>
        <CommonBasesRow gap="4px">
          {tokens.map((currency: Currency) => {
            const isSelected = selectedCurrency?.equals(currency)

            return (
              <>
                <BaseWrapper
                  tabIndex={0}
                  onKeyPress={(e) => !isSelected && e.key === 'Enter' && onSelect(currency)}
                  onClick={() => !isSelected && onSelect(currency)}
                  disable={isSelected}
                  key={currencyId(currency)}
                >
                  <CurrencyLogoFromList currency={currency} />
                  <Text fontWeight={500} fontSize={16}>
                    <TokenSymbol token={currency} length={6} />
                  </Text>
                </BaseWrapper>
              </>
            )
          })}
        </CommonBasesRow>
      </StyledScrollarea>
    </MobileWrapper>
  ) : null
}

/** helper component to retrieve a base currency from the active token lists */
function CurrencyLogoFromList({ currency }: { currency: Currency }) {
  return <CurrencyLogo currency={currency} style={{ marginRight: 8 }} />
}
