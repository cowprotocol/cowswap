import { useFlags } from 'launchdarkly-react-client-sdk'

type SolversFeatureFlags = {
  isSolversEnabled?: boolean
}

export function useSolversFeatureFlag(): boolean {
  const flags = useFlags() as SolversFeatureFlags

  return flags.isSolversEnabled ?? false
}
