import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { LightGreyCard } from 'components/Card'
import QuestionHelper from 'components/QuestionHelper'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useTheme from 'hooks/useTheme'
import { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import TokenListLogo from 'assets/svg/tokenlist.svg'
import { useIsUserAddedToken } from 'hooks/Tokens'
import { useCombinedActiveList } from 'state/lists/hooks'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { ThemedText } from 'theme'
import { isTokenOnList } from 'utils'
import Column from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import Loader from 'components/Loader'
import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import ImportRow from 'components/SearchModal/ImportRow'
// import { MenuItem } from './styleds'

// MOD imports
import { MenuItem } from '.' // mod
import { useIsUnsupportedToken } from 'state/lists/hooks/hooksMod'
import { formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'

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
    overflow-y: auto;
    scrollbar-color: ${({ theme }) => `${theme.card.border} ${theme.card.background2}`};
    scroll-behavior: smooth;

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
  isUnsupported, // gp-swap added
  TokenTagsComponent = TokenTags, // gp-swap added
  BalanceComponent = Balance, // gp-swap added
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
  showCurrencyAmount?: boolean
  isUnsupported: boolean // gp-added
  BalanceComponent?: (params: { balance: CurrencyAmount<Currency> }) => JSX.Element // gp-swap added
  TokenTagsComponent?: (params: { currency: Currency; isUnsupported: boolean }) => JSX.Element // gp-swap added
}) {
  const { account } = useActiveWeb3React()
  const key = currencyKey(currency)
  const selectedTokenList = useCombinedActiveList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency.isToken ? currency : undefined)
  const customAdded = useIsUserAddedToken(currency)
  const balance = useCurrencyBalance(account ?? undefined, currency)

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      className={`token-item token-item-${key}`}
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
  BalanceComponent = Balance, // gp-swap added
  TokenTagsComponent = TokenTags, // gp-swap added
}: {
  height: number
  currencies: Currency[]
  otherListTokens?: WrappedTokenInfo[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showImportView: () => void
  setImportToken: (token: Token) => void
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  BalanceComponent?: (params: { balance: CurrencyAmount<Currency> }) => JSX.Element // gp-swap added
  TokenTagsComponent?: (params: { currency: Currency; isUnsupported: boolean }) => JSX.Element // gp-swap added
}) {
  const itemData: (Currency | BreakLine)[] = useMemo(() => {
    if (otherListTokens && otherListTokens?.length > 0) {
      return [...currencies, BREAK_LINE, ...otherListTokens]
    }
    return currencies
  }, [currencies, otherListTokens])

  const checkIsUnsupported = useIsUnsupportedToken() // gp-added

  const Row = useCallback(
    function TokenRow({ data, index, style }) {
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

      const isUnsupported = checkIsUnsupported(token?.address) // gp-added

      if (showImport && token) {
        return (
          <ImportRow style={style} token={token} showImportView={showImportView} setImportToken={setImportToken} dim />
        )
      } else if (currency) {
        return (
          <CurrencyRow
            style={style}
            currency={currency}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
            BalanceComponent={BalanceComponent} // gp-swap added
            TokenTagsComponent={TokenTagsComponent} // gp-swap added
            isUnsupported={isUnsupported}
            showCurrencyAmount={showCurrencyAmount}
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
      checkIsUnsupported,
      BalanceComponent,
      TokenTagsComponent,
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
