import { useCallback, useRef, useState } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { ButtonPrimary } from 'legacy/components/Button'
import Loader from 'legacy/components/Loader'
import { shortenAddress } from 'legacy/utils'

import { SelectDropdown } from 'common/pure/SelectDropdown'
import { TokenAmount } from 'common/pure/TokenAmount'

import * as styledEl from './styled'

export interface AccountIndexSelectProps {
  accountsList: string[]
  currentIndex: number
  balances: { [account: string]: CurrencyAmount<Currency> | undefined }
  onAccountIndexChange(index: number): void
  loadMoreAccounts(): Promise<void>
}

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
              <Trans>Please select which account you would like to use:</Trans>

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
                      <Trans>Loading...</Trans>
                    </>
                  ) : (
                    <Trans>Load more</Trans>
                  )}
                </styledEl.LoaderContainer>
              </styledEl.SelectWrapper>
            </styledEl.TextWrapper>

            <ButtonPrimary $borderRadius="12px" padding="12px" onClick={onAccountIndexChangeCallback}>
              <Trans>Connect selected account</Trans>
            </ButtonPrimary>
          </>
        </styledEl.LoadingWrapper>
      </styledEl.LoadingMessage>
    </styledEl.Wrapper>
  )
}
