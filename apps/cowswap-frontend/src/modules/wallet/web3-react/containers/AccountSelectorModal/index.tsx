import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useAddSnackbar } from '@cowswap/snackbars'
import { useWeb3React } from '@web3-react/core'

import { Trans } from '@lingui/macro'

import { useNativeCurrencyBalances } from 'modules/tokens/hooks/useCurrencyBalance'

import { CowModal } from 'common/pure/Modal'

import { accountsLoaders } from './accountsLoaders'
import { accountSelectorModalAtom, toggleAccountSelectorModalAtom } from './state'
import * as styledEl from './styled'

import { hwAccountIndexAtom } from '../../../api/state'
import { getConnectionIcon, getConnectionName } from '../../../api/utils/connection'
import { getWeb3ReactConnection, HardWareWallet } from '../../connection'
import { AccountIndexSelect } from '../../pure/AccountIndexSelect'

export function AccountSelectorModal() {
  const { isOpen } = useAtomValue(accountSelectorModalAtom)
  const closeModal = useSetAtom(toggleAccountSelectorModalAtom)

  const [hwAccountIndex, setHwAccountIndex] = useAtom(hwAccountIndexAtom)
  const { connector } = useWeb3React()
  const addSnackbar = useAddSnackbar()

  const connectionType = useMemo(() => getWeb3ReactConnection(connector).type, [connector])

  const walletIcon = useMemo(() => getConnectionIcon(connectionType), [connectionType])
  const walletName = useMemo(() => getConnectionName(connectionType), [connectionType])

  const accountsLoader = useMemo(() => accountsLoaders[connectionType as HardWareWallet], [connectionType])

  const [accountsList, setAccountsList] = useState<string[] | null>(null)

  const balances = useNativeCurrencyBalances(accountsList || undefined, true)

  const loadMoreAccounts = useCallback(async () => {
    if (!accountsLoader) return

    return accountsLoader.loadMoreAccounts().then(() => {
      setAccountsList(accountsLoader.getAccounts())
    })
  }, [accountsLoader])

  const onAccountIndexChange = useCallback(
    (index: number) => {
      setHwAccountIndex(index)
      closeModal()

      addSnackbar({ content: <Trans>{walletName} account changed</Trans>, id: 'account-changed', icon: 'success' })
    },
    [walletName, addSnackbar, setHwAccountIndex, closeModal]
  )

  useEffect(() => {
    setAccountsList(accountsLoader?.getAccounts() || null)
  }, [accountsLoader])

  if (!accountsList || !accountsLoader) return null

  return (
    <CowModal maxWidth={600} isOpen={isOpen} onDismiss={closeModal} minHeight={false} maxHeight={90}>
      <styledEl.Wrapper>
        <styledEl.Header>
          <h3>
            <styledEl.WalletIcon src={walletIcon} alt={walletName} /> <Trans>Select {walletName} Account</Trans>
          </h3>
          <styledEl.CloseIcon onClick={closeModal} />
        </styledEl.Header>
        <AccountIndexSelect
          balances={balances}
          currentIndex={hwAccountIndex}
          onAccountIndexChange={onAccountIndexChange}
          accountsList={accountsList}
          loadMoreAccounts={loadMoreAccounts}
        />
      </styledEl.Wrapper>
    </CowModal>
  )
}
