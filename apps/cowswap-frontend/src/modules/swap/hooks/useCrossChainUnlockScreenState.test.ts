import {
  CrossChainUnlockScreenContext,
  CrossChainUnlockScreenState,
  getCrossChainUnlockScreenState,
} from './useCrossChainUnlockScreenState'

const DEFAULT_CONTEXT: CrossChainUnlockScreenContext = {
  isConnected: false,
  isEagerConnectInProgress: false,
  isHydrated: true,
  isInjectedWidget: false,
  isNetworkDeprecated: false,
  isNetworkUnsupported: false,
  isSmartContractWallet: undefined,
  isUnlocked: false,
}

describe('getCrossChainUnlockScreenState', () => {
  test.each<[string, Partial<CrossChainUnlockScreenContext>, CrossChainUnlockScreenState]>([
    ['waits for hydration', { isHydrated: false }, 'pending'],
    ['waits for eager connection', { isEagerConnectInProgress: true }, 'pending'],
    ['waits for the connected wallet type', { isConnected: true }, 'pending'],
    ['shows for a disconnected user', {}, 'visible'],
    ['shows for a connected EOA', { isConnected: true, isSmartContractWallet: false }, 'visible'],
    ['hides after unlock', { isUnlocked: true }, 'hidden'],
    ['hides for a smart-contract wallet', { isConnected: true, isSmartContractWallet: true }, 'hidden'],
    ['hides in an injected widget', { isInjectedWidget: true }, 'hidden'],
    ['hides on an unsupported network', { isNetworkUnsupported: true }, 'hidden'],
    ['hides on a deprecated network', { isNetworkDeprecated: true }, 'hidden'],
  ])('%s', (_name, context, expected) => {
    expect(getCrossChainUnlockScreenState({ ...DEFAULT_CONTEXT, ...context })).toBe(expected)
  })
})
