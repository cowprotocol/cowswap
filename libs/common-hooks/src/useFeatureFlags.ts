import { useFlags } from 'launchdarkly-react-client-sdk'

export interface FeatureFlags {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// const defaults: Partial<FeatureFlags> = {
// }

export function useFeatureFlags(): FeatureFlags {
  const flags = useFlags<FeatureFlags>()
  return flags
  // return { ...defaults, ...flags }
}
