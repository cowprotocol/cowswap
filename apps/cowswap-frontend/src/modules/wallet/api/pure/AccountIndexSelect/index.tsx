import { ChangeEvent, useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { TokenAmount } from 'common/pure/TokenAmount'

const Wrapper = styled.form`
  font-size: 14px;
  margin: 10px 0;
`

export interface AccountIndexSelectProps {
  accountsList: string[]
  currentIndex: number
  balances: { [account: string]: CurrencyAmount<Currency> | undefined }
  onAccountIndexChange(index: number): void
}

export function AccountIndexSelect(props: AccountIndexSelectProps) {
  const { currentIndex, accountsList, balances, onAccountIndexChange } = props

  const onAccountIndexChangeCallback = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      event.preventDefault()
      const index = +(event.target.value || 0)
      onAccountIndexChange(index)
    },
    [onAccountIndexChange]
  )

  return (
    <Wrapper>
      <p>Hardware account index:</p>
      <select onChange={onAccountIndexChangeCallback}>
        {accountsList.map((account, index) => {
          const balance = balances[account]

          return (
            <option key={account} value={index} selected={index === currentIndex}>
              {index}. {account}{' '}
              {balance ? <TokenAmount amount={balance} tokenSymbol={{ symbol: balance.currency.symbol }} /> : null}
            </option>
          )
        })}
      </select>
    </Wrapper>
  )
}
