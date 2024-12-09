'use client'

import { useInitializeUtm } from 'modules/utm'

export function useSetupPage() {
  useInitializeUtm()
}
