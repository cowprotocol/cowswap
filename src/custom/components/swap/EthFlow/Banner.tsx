import { ArrowDown, ArrowUp } from 'react-feather'
import styled from 'styled-components/macro'
import { useState } from 'react'
import { Separator } from 'theme'
import { Props } from '.'
import { ETH_FLOW_SLIPPAGE } from 'state/ethFlow/updater'
import { PERCENTAGE_PRECISION } from 'constants/index'
import ethFlowIcon from 'assets/svg/ethFlow.svg'

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
  grid-template-columns: repeat(3, auto);
  align-items: center;
  justify-content: stretch;

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

type BannerProps = Pick<Props, 'native' | 'wrapped' | 'isNativeIn'> & {
  callback: () => void
}

export default function Banner({ native, wrapped, isNativeIn, callback }: BannerProps) {
  const [open, setOpen] = useState(false)

  if (!isNativeIn) return null

  return (
    <BannerWrapper>
      <ClosedBannerWrapper>
        <img alt="eth-flow-icon" src={ethFlowIcon} />
        <strong>Wrap your {native.symbol} to benefit from the classic CowSwap experience!</strong>
        {open ? (
          <ArrowUp size={20} onClick={() => setOpen(false)} />
        ) : (
          <ArrowDown size={20} onClick={() => setOpen(true)} />
        )}
      </ClosedBannerWrapper>
      {open && (
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
          <WrapEthCta onClick={callback}>
            <span>Wrap my {native.symbol}</span>
          </WrapEthCta>
        </BannerInnerWrapper>
      )}
    </BannerWrapper>
  )
}
