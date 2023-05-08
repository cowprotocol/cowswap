import { useFeatureFlags } from '@cow/common/hooks/useFeatureFlags'
import { ReactNode } from 'react'

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
