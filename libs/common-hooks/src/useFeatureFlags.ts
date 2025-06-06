import { useFlags } from 'launchdarkly-react-client-sdk'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useFeatureFlags() {
  return useFlags()
}
