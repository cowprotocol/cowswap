import { useCallback, useRef, useState } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { ButtonPrimary, Loader, SelectDropdown, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'


import * as styledEl from './styled'

export interface AccountIndexSelectProps {
  accountsList: string[]
  currentIndex: number
  balances: { [account: string]: CurrencyAmount<Currency> | undefined }
  onAccountIndexChange(index: number): void
  loadMoreAccounts(): Promise<void>
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function AccountIndexSelect(props: AccountIndexSelectProps) {
  const { currentIndex, accountsList, balances, onAccountIndexChange, loadMoreAccounts } = props
  const selectRef = useRef<HTMLSelectElement>(null)
  const [loadingAccounts, setLoadingAccounts] = useState(false)

  const onAccountIndexChangeCallback = useCallback(() => {
    const index = +(selectRef.current?.value || 0)

    onAccountIndexChange(index)
  }, [onAccountIndexChange])

  const loadMoreAccountsCallback = useCallback(async () => {
    setLoadingAccounts(true)

    try {
      await loadMoreAccounts()
    } catch (e) {
      console.error('Loading more accounts error:', e)
    }

    setLoadingAccounts(false)
  }, [loadMoreAccounts])

  return (
    <styledEl.Wrapper>
      <styledEl.LoadingMessage>
        <styledEl.LoadingWrapper>
          <>
            <styledEl.TextWrapper>
              Please select which account you would like to use:
              <styledEl.SelectWrapper>
                <SelectDropdown ref={selectRef} defaultValue={currentIndex}>
                  {accountsList.map((address, index) => {
                    const balance = balances[address]

                    return (
                      <option key={index} value={index}>
                        #{index} - {shortenAddress(address, 8)}
                        {balance ? (
                          <>
                            {' - '}
                            <TokenAmount amount={balance} tokenSymbol={{ symbol: balance.currency.symbol }} />
                          </>
                        ) : null}
                      </option>
                    )
                  })}
                </SelectDropdown>

                <styledEl.LoaderContainer disabled={loadingAccounts} onClick={loadMoreAccountsCallback}>
                  {loadingAccounts ? (
                    <>
                      <Loader stroke="currentColor" size="12px" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </styledEl.LoaderContainer>
              </styledEl.SelectWrapper>
            </styledEl.TextWrapper>

            <ButtonPrimary $borderRadius="12px" padding="12px" onClick={onAccountIndexChangeCallback}>
              Connect selected account
            </ButtonPrimary>
          </>
        </styledEl.LoadingWrapper>
      </styledEl.LoadingMessage>
    </styledEl.Wrapper>
  )
}
