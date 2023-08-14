import { useAtom } from 'jotai'
import { ChangeEvent, useCallback, useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'

import styled from 'styled-components/macro'

import { useNativeCurrencyBalances } from 'modules/tokens/hooks/useCurrencyBalance'

import { TokenAmount } from 'common/pure/TokenAmount'

import { getWeb3ReactConnection, HardWareWallet } from '../../web3-react/connection'
import { trezorConnection } from '../../web3-react/connection/trezor'
import { hwAccountIndexAtom } from '../state'
import { ConnectionType } from '../types'

const Wrapper = styled.form`
  font-size: 14px;
  margin: 10px 0;
`

const accountsLoaders: Record<HardWareWallet, () => string[] | null> = {
  [ConnectionType.TREZOR]: () => trezorConnection.connector.getAccounts(),
}

// TODO: add styles
export function HwAccountIndexSelector() {
  const [hwAccountIndex, setHwAccountIndex] = useAtom(hwAccountIndexAtom)
  const { connector } = useWeb3React()

  const accountsList = useMemo(() => {
    const loader = accountsLoaders[getWeb3ReactConnection(connector).type as HardWareWallet]

    if (!loader) return null

    return loader()
  }, [connector])

  const balances = useNativeCurrencyBalances(accountsList || undefined, true)

  const onHwAccountIndexChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      event.preventDefault()

      const index = +(event.target.value || 0)

      setHwAccountIndex(index)
    },
    [setHwAccountIndex]
  )

  return (
    <Wrapper>
      <p>Hardware account index:</p>
      <select onChange={(event) => onHwAccountIndexChange(event)}>
        {accountsList?.map((account, index) => {
          const balance = balances[account]

          return (
            <option key={account} value={index} selected={index === hwAccountIndex}>
              {index}. {account}{' '}
              {balance ? <TokenAmount amount={balance} tokenSymbol={{ symbol: balance.currency.symbol }} /> : null}
            </option>
          )
        })}
      </select>
    </Wrapper>
  )
}
