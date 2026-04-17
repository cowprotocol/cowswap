import { atom } from 'jotai'

function getInitialHooksEnabled(): boolean {
  const hashSearch = window.location.hash.split('?')[1]

  if (!hashSearch) return false

  return new URLSearchParams(hashSearch).get('hooksEnabled') === 'true'
}

export const injectedWidgetHooksEnabledAtom = atom(getInitialHooksEnabled())
