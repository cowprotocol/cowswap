import { useAtom } from 'jotai'
import { useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'

import { useNativeCurrencyBalances } from 'modules/tokens/hooks/useCurrencyBalance'

import { getWeb3ReactConnection, HardWareWallet } from '../../../web3-react/connection'
import { trezorConnection } from '../../../web3-react/connection/trezor'
import { AccountIndexSelect } from '../../pure/AccountIndexSelect'
import { hwAccountIndexAtom } from '../../state'
import { ConnectionType } from '../../types'

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

  if (!accountsList) return null

  return (
    <AccountIndexSelect
      balances={balances}
      currentIndex={hwAccountIndex}
      onAccountIndexChange={setHwAccountIndex}
      accountsList={accountsList}
    />
  )
}
