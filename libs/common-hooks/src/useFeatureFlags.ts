import { useFlags } from 'launchdarkly-react-client-sdk'

export interface FeatureFlags {
  isPartialApproveEnabled: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

const defaults: Partial<FeatureFlags> = {
  isPartialApproveEnabled: true,
}

export function useFeatureFlags(): FeatureFlags {
  const flags = useFlags<FeatureFlags>()
  return { ...defaults, ...flags }
}
