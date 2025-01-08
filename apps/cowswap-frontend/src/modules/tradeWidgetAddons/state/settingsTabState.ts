import { atom, useSetAtom } from 'jotai'

export const settingsTabStateAtom = atom({ open: false })

export function useOpenSettingsTab() {
  const setSettingTabState = useSetAtom(settingsTabStateAtom)

  return () => setSettingTabState({ open: true })
}
