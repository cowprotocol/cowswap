import { useFlags } from 'launchdarkly-react-client-sdk'

export function useFeatureFlags() {
  return useFlags()
}
