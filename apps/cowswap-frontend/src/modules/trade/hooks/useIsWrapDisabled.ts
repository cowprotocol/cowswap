import { useFeatureFlags } from '@cowprotocol/common-hooks'

export function useIsWrapDisabled(): boolean {
  const { isWrapDisabled = true } = useFeatureFlags()
  return isWrapDisabled
}
