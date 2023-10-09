import { USDC_MAINNET, WBTC } from '@cowprotocol/common-const'
import { Identicon } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { IconSpinner } from '../IconSpinner'

import { PermitModal } from './index'

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`

const INPUT_AMOUNT = CurrencyAmount.fromRawAmount(USDC_MAINNET, 500_000 * 10 ** USDC_MAINNET.decimals)
const OUTPUT_AMOUNT = CurrencyAmount.fromRawAmount(WBTC, 1.2 * 10 ** WBTC.decimals)

const WALLET_ICON = (
  <IconSpinner size={84}>
    <Identicon account={'0x31fff2'} size={80} />
  </IconSpinner>
)

const PermitModalFixtures = {
  'SWAP: Pending permit signature': (
    <Wrapper>
      <PermitModal
        inputAmount={INPUT_AMOUNT}
        outputAmount={OUTPUT_AMOUNT}
        step="approve"
        icon={WALLET_ICON}
        orderType={'Swap'}
      />
    </Wrapper>
  ),
  'SWAP: Pending order signature': (
    <Wrapper>
      <PermitModal
        inputAmount={INPUT_AMOUNT}
        outputAmount={OUTPUT_AMOUNT}
        step="submit"
        icon={WALLET_ICON}
        orderType={'Swap'}
      />
    </Wrapper>
  ),
  'LIMIT: Pending permit signature': (
    <Wrapper>
      <PermitModal
        inputAmount={INPUT_AMOUNT}
        outputAmount={OUTPUT_AMOUNT}
        step="approve"
        icon={WALLET_ICON}
        orderType={'Limit Order'}
      />
    </Wrapper>
  ),
  'LIMIT: Pending order signature': (
    <Wrapper>
      <PermitModal
        inputAmount={INPUT_AMOUNT}
        outputAmount={OUTPUT_AMOUNT}
        step="submit"
        icon={WALLET_ICON}
        orderType={'Limit Order'}
      />
    </Wrapper>
  ),
  // These two cases should happen, but including for completeness as the parameters allow it
  'Missing amounts on approve': (
    <Wrapper>
      <PermitModal inputAmount={undefined} outputAmount={undefined} step="approve" orderType={'Swap'} />
    </Wrapper>
  ),
  'Missing amounts on submit': (
    <Wrapper>
      <PermitModal inputAmount={undefined} outputAmount={undefined} step="submit" orderType={'Swap'} />
    </Wrapper>
  ),
}

export default PermitModalFixtures
