import { Separator } from 'theme'
import styled from 'styled-components/macro'
import { ArrowDown, ArrowUp, Copy } from 'react-feather'
import { ETH_FLOW_SLIPPAGE } from '@cow/modules/ethFlow/state/updater'
import { PERCENTAGE_PRECISION } from 'constants/index'
import { EthFlowBannerProps } from '@cow/modules/swap/containers/EthFlow/EthFlowBanner'
import { Currency, Token } from '@uniswap/sdk-core'

const BannerWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg7};
  border: 1px solid ghostwhite;
  border-radius: ${({ theme }) => theme.buttonOutlined.borderRadius};
  padding: 10px 12px;
  margin: 12px 0 8px;
`

const ClosedBannerWrapper = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 0.7fr auto 0.7fr;
  align-items: center;
  > strong {
    font-size: 14px;
    font-weight: 600;
  }
  > svg:last-child {
    cursor: pointer;
  }
  > svg,
  > strong {
    margin: auto;
  }
`

const BannerInnerWrapper = styled.div`
  display: grid;
  grid-template-rows: auto;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 14px;
  > p {
    padding: 0 10px;
    margin-bottom: 0;
  }
`

const WrapEthCta = styled(BannerInnerWrapper)`
  flex-flow: row nowrap;
  > span {
    cursor: pointer;
    font-weight: bold;
    margin: 12px 0 4px;
  }
`

export interface EthFlowBannerContentProps extends EthFlowBannerProps {
  native: Currency
  wrapped: Token & { logoURI: string }
  showBanner: boolean
  showBannerCallback: (state: boolean) => void
  ethFlowCallback: () => void
}

export function EthFlowBannerContent(props: EthFlowBannerContentProps) {
  const { native, wrapped, showBanner, showBannerCallback, ethFlowCallback } = props
  return (
    <BannerWrapper>
      <ClosedBannerWrapper>
        {/* TODO: change to svg */}
        <Copy size={18} />
        <strong>Wrap your {native.symbol} to benefit from the classic CowSwap experience!</strong>
        {showBanner ? (
          <ArrowUp size={20} onClick={() => showBannerCallback(false)} />
        ) : (
          <ArrowDown size={20} onClick={() => showBannerCallback(true)} />
        )}
      </ClosedBannerWrapper>
      {showBanner && (
        <BannerInnerWrapper>
          <p>
            You will be prompted to wrap your {native.symbol} to {wrapped.symbol} before placing your order. This way,
            you&apos;ll benefit from:
          </p>
          <ul>
            <li>Lower overall fees</li>
            <li>Lower default slippage (instead of {ETH_FLOW_SLIPPAGE.toSignificant(PERCENTAGE_PRECISION)}%)</li>
            <li>No fees for failed transactions</li>
          </ul>
          <Separator />
          <WrapEthCta onClick={ethFlowCallback}>
            <span>Wrap my {native.symbol} and swap</span>
          </WrapEthCta>
        </BannerInnerWrapper>
      )}
    </BannerWrapper>
  )
}
