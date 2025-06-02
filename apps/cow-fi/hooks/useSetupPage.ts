'use client'

import { useInitializeUtm } from 'modules/utm/hooks'

export function useSetupPage() {
  useInitializeUtm()
}
