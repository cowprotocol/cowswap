import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

interface FeatureGuardProps {
  featureFlag: string
  children: ReactNode
  defaultContent?: ReactNode
}

export function FeatureGuard({ featureFlag, children, defaultContent }: FeatureGuardProps) {
  const flags = useFeatureFlags()

  if (flags[featureFlag]) {
    return <>{children}</>
  }

  return defaultContent || null
}
