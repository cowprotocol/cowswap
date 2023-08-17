import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useWeb3React } from '@web3-react/core'

import { useNativeCurrencyBalances } from 'modules/tokens/hooks/useCurrencyBalance'

import { CowModal } from 'common/pure/Modal'

import { accountsLoaders } from './accountsLoaders'
import { accountSelectorModalAtom, toggleAccountSelectorModalAtom } from './state'
import * as styledEl from './styled'

import { hwAccountIndexAtom } from '../../../api/state'
import { getWeb3ReactConnection, HardWareWallet } from '../../connection'
import { AccountIndexSelect } from '../../pure/AccountIndexSelect'

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
      <styledEl.Wrapper>
        <styledEl.Header>
          <h3>Select account</h3>
          <styledEl.CloseIcon onClick={closeModal} />
        </styledEl.Header>
        <AccountIndexSelect
          balances={balances}
          currentIndex={hwAccountIndex}
          onAccountIndexChange={setHwAccountIndex}
          accountsList={accountsList}
          loadMoreAccounts={loadMoreAccounts}
        />
      </styledEl.Wrapper>
    </CowModal>
  )
}
