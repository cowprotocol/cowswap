import { Trans } from '@lingui/macro'
import { Currency, Token } from '@uniswap/sdk-core'
import { ElementName, Event, EventName } from 'components/AmplitudeAnalytics/constants'
import { TraceEvent } from 'components/AmplitudeAnalytics/TraceEvent'
// import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { AutoRow } from 'components/Row'
import { useTokenInfoFromActiveList } from 'hooks/useTokenInfoFromActiveList'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { currencyId } from 'utils/currencyId'

// MOD imports
import QuestionHelper from 'components/QuestionHelper'
import { BaseWrapper, CommonBasesRow, MobileWrapper } from '.' // mod
import { useFavouriteOrCommonTokens } from 'hooks/useFavouriteOrCommonTokens'
import { getOverriddenTokenLogoURI } from 'lib/hooks/useCurrencyLogoURIs/useCurrencyLogoURIsMod'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'

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

  flex: 0 0 calc(33% - 8px);
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: auto;
  `}
`

export const StyledScrollarea = styled.div`
  overflow-y: auto;
  scrollbar-color: ${({ theme }) => `${theme.card.border} ${theme.card.background2}`};
  scroll-behavior: smooth;
  padding: 0 20px;

  &::-webkit-scrollbar {
    width: 10px;
    background: ${({ theme }) => `${theme.card.background2}`} !important;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => `${theme.card.border}`} !important;
    border: 3px solid transparent;
    border-radius: 14px;
    background-clip: padding-box;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    overflow-y: hidden;
    overflow-x: auto;
  `}
`

const formatAnalyticsEventProperties = (
  currency: Currency,
  tokenAddress: string | undefined,
  searchQuery: string,
  isAddressSearch: string | false
) => ({
  token_symbol: currency?.symbol,
  token_chain_id: currency?.chainId,
  ...(tokenAddress ? { token_address: tokenAddress } : {}),
  is_suggested_token: true,
  is_selected_from_list: false,
  is_imported_by_user: false,
  ...(isAddressSearch === false
    ? { search_token_symbol_input: searchQuery }
    : { search_token_address_input: isAddressSearch }),
})

const MAX_LENGTH_OVERFLOW = 12
export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency,
  searchQuery,
  isAddressSearch,
}: {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
  searchQuery: string
  isAddressSearch: string | false
}) {
  const tokens = useFavouriteOrCommonTokens()

  return tokens.length > 0 ? (
    <MobileWrapper gap="md" showOverflow={tokens.length > MAX_LENGTH_OVERFLOW}>
      <AutoRow padding="0 20px">
        <Text fontWeight={500} fontSize={14}>
          {/* <Trans>Common bases</Trans> */}
          <Trans>Favourite tokens</Trans>
        </Text>
        <QuestionHelper text={<Trans>Your favourite saved tokens. Edit this list in your account page.</Trans>} />
      </AutoRow>
      <StyledScrollarea>
        <CommonBasesRow gap="4px">
          {tokens.map((currency: Currency) => {
            const isSelected = selectedCurrency?.equals(currency)
            const tokenAddress = currency instanceof Token ? currency?.address : undefined

            return (
              <TraceEvent
                events={[Event.onClick, Event.onKeyPress]}
                name={EventName.TOKEN_SELECTED}
                properties={formatAnalyticsEventProperties(currency, tokenAddress, searchQuery, isAddressSearch)}
                element={ElementName.COMMON_BASES_CURRENCY_BUTTON}
                key={currencyId(currency)}
              >
                <BaseWrapper
                  tabIndex={0}
                  onKeyPress={(e) => !isSelected && e.key === 'Enter' && onSelect(currency)}
                  onClick={() => !isSelected && onSelect(currency)}
                  disable={isSelected}
                  key={currencyId(currency)}
                >
                  <CurrencyLogoFromList currency={currency} />
                  <Text fontWeight={500} fontSize={16}>
                    {currency.symbol}
                  </Text>
                </BaseWrapper>
              </TraceEvent>
            )
          })}
        </CommonBasesRow>
      </StyledScrollarea>
    </MobileWrapper>
  ) : null
}

/** helper component to retrieve a base currency from the active token lists */
function CurrencyLogoFromList({ currency }: { currency: Currency }) {
  const token = useTokenInfoFromActiveList(currency)

  let tokenAux = token
  if (token instanceof WrappedTokenInfo) {
    const logoURI = getOverriddenTokenLogoURI(token)
    tokenAux = logoURI ? new WrappedTokenInfo({ ...token.tokenInfo, logoURI }, token.list) : token
  }

  return <CurrencyLogo currency={tokenAux} style={{ marginRight: 8 }} />
}
