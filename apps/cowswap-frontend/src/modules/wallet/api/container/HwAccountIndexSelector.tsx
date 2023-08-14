import { useAtom } from 'jotai'
import { ChangeEvent, useCallback, useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'

import styled from 'styled-components/macro'

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
          return (
            <option value={index} selected={index === hwAccountIndex}>
              {index}. {account}
            </option>
          )
        })}
      </select>
    </Wrapper>
  )
}
