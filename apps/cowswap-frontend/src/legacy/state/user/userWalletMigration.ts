const MIGRATION_FLAG = 'redux-user-wallet-migrated-2024-05-13'

/**
 * Along with EIP-6963 support, we are migrating the user wallet state to a new structure.
 * Actually, we removed ConnectionType.INJECTED_WIDGET and unified ConnectionType.INJECTED
 * TODO: Remove after 2024-07-20
 */
export function userWalletMigration() {
  if (localStorage.getItem(MIGRATION_FLAG)) return

  const storeName = 'redux_localstorage_simple_user'

  const store = localStorage.getItem(storeName)

  if (!store) return

  try {
    const parsedStore = JSON.parse(store)

    delete parsedStore['selectedWallet']

    localStorage.setItem(storeName, JSON.stringify(parsedStore))
  } catch (e) {
    console.error('Could not parse user wallet store to migrate', e)
  }

  localStorage.setItem(MIGRATION_FLAG, '1')
}
