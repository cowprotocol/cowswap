import { test } from '@playwright/test'

import walletSetup from './wallet.setup'

// Not part of the test suite (lives outside src/tests). Run via hashProbe.config.ts by
// buildWalletCache.ts to learn the wallet-setup hash Synpress computes at test runtime.
// The hash depends on Playwright's babel transform of the setup function, which differs
// from the synpress CLI's source-regex extraction — see buildWalletCache.ts.
test('wallet setup hash probe', () => {
  console.log(`WALLET_SETUP_HASH=${walletSetup.hash}`)
})
