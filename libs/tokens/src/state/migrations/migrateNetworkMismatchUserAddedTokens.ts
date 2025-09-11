// TODO: remove after 01.01.2026
/**
 * There was a bug which could lead to adding a custom token from a different network
 * It was fixed in https://github.com/cowprotocol/cowswap/pull/4060
 * Anyway, some users might have an old localStorage with consequences of the bug
 * To fix that we have this migration that removes tokens that don't belong to current network
 */
export function migrateNetworkMismatchUserAddedTokens(): void {
  const stateRaw = localStorage.getItem('userAddedTokensAtom:v1')

  if (!stateRaw) return

  try {
    const state = JSON.parse(stateRaw)
    let hasChanges = false

    Object.keys(state).forEach((chainId) => {
      const chainState = state[chainId]

      Object.keys(chainState).forEach((tokenAddress) => {
        const token = chainState[tokenAddress]

        if (token.chainId && +token.chainId !== +chainId) {
          hasChanges = true
          delete chainState[tokenAddress]
        }
      })
    })

    if (hasChanges) {
      localStorage.setItem('userAddedTokensAtom:v1', JSON.stringify(state))
    }
  } catch {}
}
