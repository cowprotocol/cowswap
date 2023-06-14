import { ReactNode } from 'react'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'

interface FeatureGuardProps {
  featureFlag: string
  children: ReactNode
}

export function FeatureGuard({ featureFlag, children }: FeatureGuardProps) {
  const flags = useFeatureFlags()

  if (flags[featureFlag]) {
    return <>{children}</>
  }

  return null
}
