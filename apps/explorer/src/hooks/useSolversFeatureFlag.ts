import { useFlags } from 'launchdarkly-react-client-sdk'

export function useSolversFeatureFlag(): boolean {
  const flags = useFlags() as SolversFeatureFlags

  return flags.isSolversEnabled ?? false
}

type SolversFeatureFlags = {
  isSolversEnabled?: boolean
}
