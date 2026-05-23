import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'

import walletSetup from './walletSetup'

export const synpressTest = testWithSynpress(metaMaskFixtures(walletSetup))
export { MetaMask }
