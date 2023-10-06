import { useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useUnsupportedTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Edit, X } from 'react-feather'

import { OnchainState, TokenAmounts, useOnchainBalances } from 'modules/tokens'

import { useNativeBalance } from 'common/hooks/useNativeBalance'

import * as styledEl from './styled'

import { IconButton } from '../../pure/commonElements'
import { FavouriteTokensList } from '../../pure/FavouriteTokensList'
import { TokensVirtualList } from '../../pure/TokensVirtualList'
import { TokenSearchResults } from '../TokenSearchResults'

export interface SelectTokenModalProps {
  allTokens: TokenWithLogo[]
  favouriteTokens: TokenWithLogo[]
  balances: { [key: string]: CurrencyAmount<Currency> }
  selectedToken?: string
  onSelectToken(token: TokenWithLogo): void
  defaultInputValue?: string
  onOpenManageWidget(): void
  onDismiss(): void
}

const permitCompatibleTokens: { [tokenAddress: string]: boolean } = {} // TODO: Make dynamic

export function SelectTokenModal(props: SelectTokenModalProps) {
  const {
    defaultInputValue = '',
    favouriteTokens,
    allTokens,
    selectedToken,
    onSelectToken,
    onDismiss,
    onOpenManageWidget,
  } = props

  const [inputValue, setInputValue] = useState<string>(defaultInputValue)

  const { account } = useWalletInfo()

  const unsupportedTokens = useUnsupportedTokens()

  const nativeBalance = useNativeBalance()
  const { amounts: onChainBalances, isLoading } = useOnchainBalances({ account, tokens: allTokens })

  const balances: TokenAmounts | null = useMemo(() => {
    if (!account || !onChainBalances) return null

    if (!nativeBalance.data) return onChainBalances

    const { data, error } = nativeBalance

    const nativeOnChainState: OnchainState<CurrencyAmount<TokenWithLogo>> = {
      value: data,
      loading: isLoading,
      error,
      syncing: false,
      valid: true,
    }

    return { ...onChainBalances, [data.currency.address]: nativeOnChainState }
  }, [account, onChainBalances, nativeBalance, isLoading])

  const commonProps = {
    permitCompatibleTokens,
    unsupportedTokens,
    onSelectToken,
    selectedToken,
    balances,
  }

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <h3>Select a token</h3>
        <IconButton onClick={onDismiss}>
          <X />
        </IconButton>
      </styledEl.Header>
      <styledEl.Row>
        <styledEl.SearchInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          type="text"
          placeholder="Search name or past address"
        />
      </styledEl.Row>
      <styledEl.Row>
        <FavouriteTokensList onSelectToken={onSelectToken} selectedToken={selectedToken} tokens={favouriteTokens} />
      </styledEl.Row>
      <styledEl.Separator />
      {inputValue ? (
        <TokenSearchResults searchInput={inputValue} {...commonProps} />
      ) : (
        <TokensVirtualList allTokens={allTokens} {...commonProps} />
      )}
      <styledEl.Separator />
      <div>
        <styledEl.ActionButton onClick={onOpenManageWidget}>
          <Edit /> <span>Manage Token Lists</span>
        </styledEl.ActionButton>
      </div>
    </styledEl.Wrapper>
  )
}
