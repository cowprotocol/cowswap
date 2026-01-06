import { useFlags } from 'launchdarkly-react-client-sdk'

export interface FeatureFlags {
  isPartialApproveEnabled: boolean
  [key: string]: unknown
}

const defaults: Partial<FeatureFlags> = {
  isPartialApproveEnabled: true,
}

export function useFeatureFlags(): FeatureFlags {
  const flags = useFlags<FeatureFlags>()
  return { ...defaults, ...flags }
}
