import { createStore } from 'jotai/vanilla'

import { atomWithIdbStorage, localForageJotai, migrateLocalStorageKey } from './jotaiStore'

const IDB_KEY = 'atomWithIdbStorage:test'

describe('atomWithIdbStorage', () => {
  afterEach(async () => {
    await localForageJotai.removeItem(IDB_KEY)
  })

  it('reads the stored value', async () => {
    await localForageJotai.setItem(IDB_KEY, JSON.stringify({ stored: true }))

    const store = createStore()

    await expect(store.get(atomWithIdbStorage(IDB_KEY, { stored: false }))).resolves.toEqual({ stored: true })
  })

  /**
   * The atom reads its key lazily, on first access. A migration writing that key starts at module load
   * but finishes later, so without the gate the read can land first and resolve to the initial value,
   * which the next persist then writes over everything the migration produced.
   */
  it('waits for the migration before reading, even when the read comes first', async () => {
    let finishMigration: () => void = () => void 0
    const migration = new Promise<void>((resolve) => {
      finishMigration = resolve
    })

    const store = createStore()
    const value = store.get(atomWithIdbStorage(IDB_KEY, { migrated: false }, migration))

    await localForageJotai.setItem(IDB_KEY, JSON.stringify({ migrated: true }))
    finishMigration()

    await expect(value).resolves.toEqual({ migrated: true })
  })

  it('falls back to the initial value when the key is unset', async () => {
    const store = createStore()

    await expect(store.get(atomWithIdbStorage(IDB_KEY, { fallback: true }))).resolves.toEqual({ fallback: true })
  })
})

interface Settings {
  showRecipient: boolean
  enablePartialApprovalBySettings: boolean
}

describe('migrateLocalStorageKey', () => {
  const oldKey = 'my-atom:v3'
  const newKey = 'my-atom:v4'

  beforeEach(() => {
    localStorage.clear()
  })

  it('copies the old value under the new key, applying the patch', () => {
    localStorage.setItem(oldKey, JSON.stringify({ showRecipient: true }))

    migrateLocalStorageKey<Settings>(oldKey, newKey, { enablePartialApprovalBySettings: true })

    expect(JSON.parse(localStorage.getItem(newKey)!)).toEqual({
      showRecipient: true,
      enablePartialApprovalBySettings: true,
    })
  })

  it('does nothing when the new key already has a value', () => {
    localStorage.setItem(oldKey, JSON.stringify({ showRecipient: true }))
    localStorage.setItem(newKey, JSON.stringify({ showRecipient: false, enablePartialApprovalBySettings: false }))

    migrateLocalStorageKey<Settings>(oldKey, newKey, { enablePartialApprovalBySettings: true })

    expect(JSON.parse(localStorage.getItem(newKey)!)).toEqual({
      showRecipient: false,
      enablePartialApprovalBySettings: false,
    })
  })

  it('does nothing when there is no old value to migrate', () => {
    migrateLocalStorageKey<Settings>(oldKey, newKey, { enablePartialApprovalBySettings: true })

    expect(localStorage.getItem(newKey)).toBeNull()
  })

  it('does not set the new key when the old value is malformed JSON', () => {
    localStorage.setItem(oldKey, '{not-json')

    migrateLocalStorageKey<Settings>(oldKey, newKey, { enablePartialApprovalBySettings: true })

    expect(localStorage.getItem(newKey)).toBeNull()
  })
})
