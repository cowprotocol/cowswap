import { migrateLocalStorageKey } from './jotaiStore'

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
