import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { ElementName, Event, EventName } from 'components/AmplitudeAnalytics/constants'
import { TraceEvent } from 'components/AmplitudeAnalytics/TraceEvent'
import { LightGreyCard } from 'components/Card'
import QuestionHelper from 'components/QuestionHelper'
import useTheme from 'hooks/useTheme'
import { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import TokenListLogo from 'assets/svg/tokenlist.svg'
import { useAllTokens, useIsUserAddedToken } from 'hooks/Tokens'
import { useCurrencyBalance } from 'state/connection/hooks'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { ThemedText } from 'theme'
import Column from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import Loader from 'components/Loader'
import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import ImportRow from 'components/SearchModal/ImportRow'
import { LoadingRows /*, MenuItem*/ } from 'components/SearchModal/styleds'

// MOD imports
import { MenuItem } from '.' // mod
import { formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'
import { useIsUnsupportedTokenGp } from 'state/lists/hooks'

function currencyKey(currency: Currency): string {
  return currency.isToken ? currency.address : 'ETHER'
}

export const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

export const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

export const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`

function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <StyledBalanceText title={balance.toExact()}>{formatSmart(balance, AMOUNT_PRECISION)}</StyledBalanceText>
}

export const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

export const TokenListLogoWrapper = styled.img`
  height: 20px;
`

export const StyledScrollarea = styled.div`
  div:first-of-type {
    overflow-y: auto; // fallback for 'overlay'
    overflow-y: overlay;
    ${({ theme }) => theme.colorScrollbar};
`

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  showCurrencyAmount,
  eventProperties,
  isUnsupported, // gp-swap added
  allTokens,
  TokenTagsComponent = TokenTags, // gp-swap added
  BalanceComponent = Balance, // gp-swap added
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
  showCurrencyAmount?: boolean
  eventProperties: Record<string, unknown>
  isUnsupported: boolean // gp-added
  allTokens: { [address: string]: Token } // gp-added
  BalanceComponent?: (params: { balance: CurrencyAmount<Currency> }) => JSX.Element // gp-swap added
  TokenTagsComponent?: (params: { currency: Currency; isUnsupported: boolean }) => JSX.Element // gp-swap added
}) {
  const { account } = useWeb3React()
  const key = currencyKey(currency)
  const isOnSelectedList = currency?.isToken && !!allTokens[currency.address.toLowerCase()]
  const customAdded = useIsUserAddedToken(currency)
  const balance = useCurrencyBalance(account ?? undefined, currency)

  // only show add or remove buttons if not on selected list
  return (
    <TraceEvent
      events={[Event.onClick, Event.onKeyPress]}
      name={EventName.TOKEN_SELECTED}
      properties={{ is_imported_by_user: customAdded, ...eventProperties }}
      element={ElementName.TOKEN_SELECTOR_ROW}
    >
      <MenuItem
        tabIndex={0}
        style={style}
        className={`token-item token-item-${key}`}
        onKeyPress={(e) => (!isSelected && e.key === 'Enter' ? onSelect() : null)}
        onClick={() => (isSelected ? null : onSelect())}
        disabled={isSelected}
        selected={otherSelected}
      >
        <CurrencyLogo currency={currency} size={'24px'} />
        <Column>
          <Text title={currency.name} fontWeight={500}>
            {currency.symbol}
          </Text>
          <ThemedText.DarkGray ml="0px" fontSize={'12px'} fontWeight={300}>
            {!currency.isNative && !isOnSelectedList && customAdded ? (
              <Trans>{currency.name} • Added by user</Trans>
            ) : (
              currency.name
            )}
          </ThemedText.DarkGray>
        </Column>
        {/* <TokenTags currency={currency} /> */}
        <TokenTagsComponent currency={currency} isUnsupported={isUnsupported} />
        {showCurrencyAmount && (
          <RowFixed style={{ justifySelf: 'flex-end' }}>
            {balance ? <BalanceComponent balance={balance} /> : account ? <Loader /> : null}
          </RowFixed>
        )}
      </MenuItem>
    </TraceEvent>
  )
}

const BREAK_LINE = 'BREAK'
type BreakLine = typeof BREAK_LINE
function isBreakLine(x: unknown): x is BreakLine {
  return x === BREAK_LINE
}

function BreakLineComponent({ style }: { style: CSSProperties }) {
  const theme = useTheme()
  return (
    <FixedContentRow style={style}>
      <LightGreyCard padding="8px 12px" $borderRadius="8px">
        <RowBetween>
          <RowFixed>
            <TokenListLogoWrapper src={TokenListLogo} />
            <ThemedText.Main ml="6px" fontSize="12px" color={theme.text1}>
              <Trans>Expanded results from inactive Token Lists</Trans>
            </ThemedText.Main>
          </RowFixed>
          <QuestionHelper
            text={
              <Trans>
                Tokens from inactive lists. Import specific tokens below or click Manage to activate more lists.
              </Trans>
            }
          />
        </RowBetween>
      </LightGreyCard>
    </FixedContentRow>
  )
}

interface TokenRowProps {
  data: Array<Currency | BreakLine>
  index: number
  style: CSSProperties
}

const formatAnalyticsEventProperties = (
  token: Token,
  index: number,
  data: any[],
  searchQuery: string,
  isAddressSearch: string | false
) => ({
  token_symbol: token?.symbol,
  token_address: token?.address,
  is_suggested_token: false,
  is_selected_from_list: true,
  scroll_position: '',
  token_list_index: index,
  token_list_length: data.length,
  ...(isAddressSearch === false
    ? { search_token_symbol_input: searchQuery }
    : { search_token_address_input: isAddressSearch }),
})

// TODO: refactor the component
export default function CurrencyList({
  height,
  currencies,
  otherListTokens,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showImportView,
  setImportToken,
  showCurrencyAmount,
  isLoading,
  searchQuery,
  isAddressSearch,
  BalanceComponent = Balance, // gp-swap added
  TokenTagsComponent = TokenTags, // gp-swap added
}: {
  height: number
  currencies: Currency[]
  otherListTokens?: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showImportView: () => void
  setImportToken: (token: Token) => void
  showCurrencyAmount?: boolean
  isLoading: boolean
  searchQuery: string
  isAddressSearch: string | false
  BalanceComponent?: (params: { balance: CurrencyAmount<Currency> }) => JSX.Element // gp-swap added
  TokenTagsComponent?: (params: { currency: Currency; isUnsupported: boolean }) => JSX.Element // gp-swap added
}) {
  const allTokens = useAllTokens()
  const isUnsupportedToken = useIsUnsupportedTokenGp()

  const itemData: (Currency | BreakLine)[] = useMemo(() => {
    if (otherListTokens && otherListTokens?.length > 0) {
      // otherListTokens - it's a list of tokens from inactive lists
      // here we remove tokens that already exist in the active lists
      const filteredOtherListTokens = otherListTokens.filter((token) =>
        token.isToken ? !allTokens[token.address.toLowerCase()] : true
      )

      return [...currencies, BREAK_LINE, ...filteredOtherListTokens]
    }
    return currencies
  }, [currencies, otherListTokens, allTokens])

  const Row = useCallback(
    function TokenRow({ data, index, style }: TokenRowProps) {
      const row: Currency | BreakLine = data[index]

      if (isBreakLine(row)) {
        return <BreakLineComponent style={style} />
      }

      const currency = row

      const isSelected = Boolean(currency && selectedCurrency && selectedCurrency.equals(currency))
      const otherSelected = Boolean(currency && otherCurrency && otherCurrency.equals(currency))
      const handleSelect = () => currency && onCurrencySelect(currency)

      const token = currency?.wrapped

      const showImport = index > currencies.length

      const isUnsupported = !!isUnsupportedToken(token?.address)

      if (isLoading) {
        return (
          <LoadingRows>
            <div />
            <div />
            <div />
          </LoadingRows>
        )
      } else if (showImport && token) {
        return (
          <ImportRow style={style} token={token} showImportView={showImportView} setImportToken={setImportToken} dim />
        )
      } else if (currency) {
        return (
          <CurrencyRow
            style={style}
            allTokens={allTokens}
            currency={currency}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
            BalanceComponent={BalanceComponent} // gp-swap added
            TokenTagsComponent={TokenTagsComponent} // gp-swap added
            isUnsupported={isUnsupported}
            showCurrencyAmount={showCurrencyAmount}
            eventProperties={formatAnalyticsEventProperties(token, index, data, searchQuery, isAddressSearch)}
          />
        )
      } else {
        return null
      }
    },
    [
      currencies.length,
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      setImportToken,
      showImportView,
      showCurrencyAmount,
      isLoading,
      isAddressSearch,
      searchQuery,
      isUnsupportedToken,
      BalanceComponent,
      TokenTagsComponent,
      allTokens,
    ]
  )

  const itemKey = useCallback((index: number, data: typeof itemData) => {
    const currency = data[index]
    if (isBreakLine(currency)) return BREAK_LINE
    return currencyKey(currency)
  }, [])

  return (
    <StyledScrollarea>
      <FixedSizeList
        height={height}
        ref={fixedListRef as any}
        width="100%"
        itemData={itemData}
        itemCount={itemData.length}
        itemSize={56}
        itemKey={itemKey}
      >
        {Row}
      </FixedSizeList>
    </StyledScrollarea>
  )
}
