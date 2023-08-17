import { atom, useAtomValue, useSetAtom, useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useWeb3React } from '@web3-react/core'

import styled from 'styled-components/macro'

import { ReactComponent as Close } from 'legacy/assets/images/x.svg'

import { useNativeCurrencyBalances } from 'modules/tokens/hooks/useCurrencyBalance'

import { CowModal } from 'common/pure/Modal'

import { hwAccountIndexAtom } from '../../../api/state'
import { ConnectionType } from '../../../api/types'
import { getWeb3ReactConnection, HardWareWallet } from '../../connection'
import { trezorConnection } from '../../connection/trezor'
import { AccountIndexSelect } from '../../pure/AccountIndexSelect'

const CloseIcon = styled(Close)`
  opacity: 0.6;
  transition: opacity 0.3s ease-in-out;
  stroke: ${({ theme }) => theme.text1};
  width: 24px;
  height: 24px;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    margin: 0;
  }
`

const Wrapper = styled.div`
  padding: 20px;
`

export interface AccountSelectorModalState {
  isOpen: boolean
}

export const accountSelectorModalAtom = atom<AccountSelectorModalState>({ isOpen: false })

export const toggleAccountSelectorModalAtom = atom(null, (get, set) => {
  set(accountSelectorModalAtom, { isOpen: !get(accountSelectorModalAtom).isOpen })
})

interface WalletAccountsLoader {
  getAccounts(): string[] | null
  loadMoreAccounts(): Promise<void>
}

const accountsLoaders: Record<HardWareWallet, WalletAccountsLoader> = {
  [ConnectionType.TREZOR]: {
    getAccounts() {
      return trezorConnection.connector.getAccounts()
    },
    loadMoreAccounts() {
      return trezorConnection.connector.loadMoreAccounts()
    },
  },
}

export function AccountSelectorModal() {
  const { isOpen } = useAtomValue(accountSelectorModalAtom)
  const closeModal = useSetAtom(toggleAccountSelectorModalAtom)

  const [hwAccountIndex, setHwAccountIndex] = useAtom(hwAccountIndexAtom)
  const { connector } = useWeb3React()

  const accountsLoader = useMemo(() => {
    return accountsLoaders[getWeb3ReactConnection(connector).type as HardWareWallet]
  }, [connector])

  const [accountsList, setAccountsList] = useState<string[] | null>(null)

  const balances = useNativeCurrencyBalances(accountsList || undefined, true)

  const loadMoreAccounts = useCallback(async () => {
    if (!accountsLoader) return

    return accountsLoader.loadMoreAccounts().then(() => {
      setAccountsList(accountsLoader.getAccounts())
    })
  }, [accountsLoader])

  useEffect(() => {
    setAccountsList(accountsLoader?.getAccounts() || null)
  }, [accountsLoader])

  if (!accountsList || !accountsLoader) return null

  return (
    <CowModal maxWidth={600} isOpen={isOpen} onDismiss={closeModal} minHeight={false} maxHeight={90}>
      <Wrapper>
        <Header>
          <h3>Select account</h3>
          <CloseIcon onClick={closeModal} />
        </Header>
        <AccountIndexSelect
          balances={balances}
          currentIndex={hwAccountIndex}
          onAccountIndexChange={setHwAccountIndex}
          accountsList={accountsList}
          loadMoreAccounts={loadMoreAccounts}
        />
      </Wrapper>
    </CowModal>
  )
}
