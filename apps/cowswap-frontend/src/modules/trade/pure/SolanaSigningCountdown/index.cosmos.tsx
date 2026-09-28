import { USDC_MAINNET, WBTC } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@cowprotocol/currency'

import styled from 'styled-components/macro'

import { SolanaSigningCountdown } from './index'

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`

const INPUT_AMOUNT = CurrencyAmount.fromRawAmount(USDC_MAINNET, 1_000 * 10 ** USDC_MAINNET.decimals)
const OUTPUT_AMOUNT = CurrencyAmount.fromRawAmount(WBTC, 1.2 * 10 ** WBTC.decimals)

const DURATION_MS = 40_000

const SolanaSigningCountdownFixtures = {
  'Counting down': (
    <Wrapper>
      <SolanaSigningCountdown
        expiresAt={Date.now() + DURATION_MS}
        durationMs={DURATION_MS}
        inputAmount={INPUT_AMOUNT}
        outputAmount={OUTPUT_AMOUNT}
      />
    </Wrapper>
  ),
  'Window closed': (
    <Wrapper>
      <SolanaSigningCountdown
        expiresAt={Date.now()}
        durationMs={DURATION_MS}
        inputAmount={INPUT_AMOUNT}
        outputAmount={OUTPUT_AMOUNT}
      />
    </Wrapper>
  ),
}

export default SolanaSigningCountdownFixtures
