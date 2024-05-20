import { useFlags } from 'launchdarkly-react-client-sdk'

// FIXME: Use common-hooks useFeatureFlags. Currently there's an issue importing this from a SSR app
export function useFeatureFlags() {
  return useFlags()
}
