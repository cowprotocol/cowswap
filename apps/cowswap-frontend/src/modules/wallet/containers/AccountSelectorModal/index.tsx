import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useNativeTokenBalance } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import {
  AccountIndexSelect,
  hwAccountIndexAtom,
  useWalletInfo,
  useConnectionType,
  useWalletDetails,
} from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { CowModal } from 'common/pure/Modal'

import { accountSelectorModalAtom, toggleAccountSelectorModalAtom } from './state'
import * as styledEl from './styled'

const EMPTY_BALANCES: { [account: string]: CurrencyAmount<Currency> | undefined } = {}

/** Per connection-type account loader (e.g. HW wallet). Populate when wagmi connector exposes getAccounts/loadMoreAccounts. */
const accountsLoaders: Record<string, { getAccounts(): string[]; loadMoreAccounts(): Promise<void> } | undefined> = {}

export function AccountSelectorModal(): ReactNode {
  const { chainId } = useWalletInfo()
  const { isOpen } = useAtomValue(accountSelectorModalAtom)
  const closeModal = useSetAtom(toggleAccountSelectorModalAtom)

  const [hwAccountIndex, setHwAccountIndex] = useAtom(hwAccountIndexAtom)
  const connectionType = useConnectionType()
  const addSnackbar = useAddSnackbar()
  const { walletName, icon: walletIcon } = useWalletDetails()

  const nativeToken = NATIVE_CURRENCIES[chainId]

  const accountsLoader = useMemo(() => accountsLoaders[connectionType], [connectionType])

  const [accountsList, setAccountsList] = useState<string[] | null>(null)

  // Stub: use single-account balance when accountsList has one item; otherwise empty
  const firstAccount = accountsList?.[0]
  const nativeBalance = useNativeTokenBalance(firstAccount)
  const nativeBalanceValue = nativeBalance?.data?.value
  const nativeTokensBalances = useMemo(
    () => (firstAccount != null && nativeBalanceValue != null ? { [firstAccount]: nativeBalanceValue } : undefined),
    [firstAccount, nativeBalanceValue],
  )

  const balances = useMemo(() => {
    if (!nativeTokensBalances) return EMPTY_BALANCES

    return Object.keys(nativeTokensBalances).reduce<{ [account: string]: CurrencyAmount<Currency> | undefined }>(
      (acc, key) => {
        const balance = nativeTokensBalances[key]
        if (balance != null) {
          acc[key] = CurrencyAmount.fromRawAmount(nativeToken as unknown as Currency, balance.toString())
        }
        return acc
      },
      {},
    )
  }, [nativeTokensBalances, nativeToken])

  const loadMoreAccounts = useCallback(async () => {
    if (!accountsLoader) return
    await accountsLoader.loadMoreAccounts()
    setAccountsList(accountsLoader.getAccounts())
  }, [accountsLoader])

  const onAccountIndexChange = useCallback(
    (index: number) => {
      setHwAccountIndex(index)
      closeModal()
      addSnackbar({ content: <Trans>{walletName} account changed</Trans>, id: 'account-changed', icon: 'success' })
    },
    [walletName, addSnackbar, setHwAccountIndex, closeModal],
  )

  useEffect(() => {
    setAccountsList(accountsLoader?.getAccounts() ?? null)
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
          accountsList={accountsList}
          currentIndex={hwAccountIndex}
          balances={balances}
          onAccountIndexChange={onAccountIndexChange}
          loadMoreAccounts={loadMoreAccounts}
        />
      </styledEl.Wrapper>
    </CowModal>
  )
}
