import React from 'react'

import loadingCowWebp from 'assets/cow-swap/cow-load.webp'
import cowGraph from 'assets/images/cow-graph.svg'
import ammsGraphEth from 'assets/images/amms-graph.svg'
import ammsGraphGC from 'assets/images/amms-graph-gc.svg'
import cowMeditatingGraph from 'assets/images/cow-meditating.svg'
import cowMeditatingSmooth from 'assets/images/cow-meditating-smoooth.svg'
import { ExecutionState as TypeExecutionState, OrderProgressBarProps } from 'components/OrderProgressBar'
import {
  // ProgressBarWrapper,
  ProgressBarInnerWrapper,
  SuccessProgress,
  CowProtocolIcon,
  GreenClockIcon,
  StatusMsgContainer,
  StatusWrapper,
  StatusMsg,
  StatusGraph,
  OrangeClockIcon,
  DelayedProgress,
  WarningLogo,
  GreenCheckIcon,
  StyledExternalLink,
  StyledCoWLink,
} from './styled'
import { SupportedChainId } from 'constants/chains'
import { CancelButton } from 'components/AccountDetails/Transaction/CancelButton'
import { AMMsLogo } from 'components/AMMsLogo'
import { getExplorerOrderLink } from 'utils/explorer'

const DOC_LINK_PHENOM_COW = 'https://docs.cow.fi/overview/coincidence-of-wants'

interface ExecutionStateProps extends OrderProgressBarProps {
  percentage: number
  executionState: TypeExecutionState
}

function ContentByExecutionState(props: ExecutionStateProps) {
  const { percentage, executionState, activityDerivedState, chainId } = props
  const { order, isCancellable } = activityDerivedState

  const progressAndMessage = () => {
    switch (executionState) {
      case 'cow': {
        return (
          <>
            <ProgressBarInnerWrapper>
              <SuccessProgress percentage={percentage}>
                <CowProtocolIcon />
              </SuccessProgress>
            </ProgressBarInnerWrapper>
            <StatusMsgContainer>
              <StatusWrapper>
                <GreenClockIcon size={16} />
                <StatusMsg>
                  Order Status: <strong>Looking for a</strong>{' '}
                  <StyledCoWLink href={DOC_LINK_PHENOM_COW} className="cowlink">
                    <strong>
                      <span>C</span>oincidence <span>o</span>f <span>W</span>ants (CoW) ↗
                    </strong>
                  </StyledCoWLink>
                </StatusMsg>
              </StatusWrapper>
              <StatusGraph>
                <img src={cowGraph} alt="Loading for a CoW..." />
                <p>
                  <strong>CoW Swap</strong> can save you gas costs and get a better price if another trader takes the
                  opposite side of your trade.
                </p>
              </StatusGraph>
            </StatusMsgContainer>
          </>
        )
      }
      case 'amm': {
        return (
          <>
            <ProgressBarInnerWrapper>
              <SuccessProgress percentage={percentage}>
                <AMMsLogo chainId={chainId} />
              </SuccessProgress>
            </ProgressBarInnerWrapper>
            <StatusMsgContainer>
              <StatusWrapper>
                <OrangeClockIcon size={16} />
                <StatusMsg>
                  Order Status: <strong>Finding the best on-chain price.</strong>
                </StatusMsg>
              </StatusWrapper>
              <StatusGraph>
                <img
                  src={chainId === SupportedChainId.GNOSIS_CHAIN ? ammsGraphGC : ammsGraphEth}
                  alt="Finding the best price ..."
                />
                <p>
                  <strong>CoW Swap</strong> searches all on-chain liquidity sources to find you the best price.
                </p>
              </StatusGraph>
            </StatusMsgContainer>
          </>
        )
      }
      case 'confirmed': {
        return (
          <>
            <ProgressBarInnerWrapper>
              <SuccessProgress percentage={100}>
                <CowProtocolIcon />
              </SuccessProgress>
            </ProgressBarInnerWrapper>
            <StatusMsgContainer>
              <StatusWrapper>
                <GreenCheckIcon size={16} />
                <StatusMsg>
                  <strong>Congrats! Your transaction has been confirmed successfully! 🚀 </strong>
                </StatusMsg>
              </StatusWrapper>
              <StatusGraph>
                <img src={cowMeditatingSmooth} alt="Cow Smoooth ..." className="meditating-cow" />
                <p>
                  Your tokens should already be in your wallet, check out your trade on the{' '}
                  <StyledExternalLink href={order ? getExplorerOrderLink(chainId, order.id) : '#'}>
                    explorer ↗
                  </StyledExternalLink>{' '}
                </p>
              </StatusGraph>
            </StatusMsgContainer>
          </>
        )
      }
      case 'unfillable': {
        return (
          <>
            <ProgressBarInnerWrapper>
              <DelayedProgress percentage={percentage}>
                <WarningLogo>
                  <img src={loadingCowWebp} alt="Loading prices..." />
                </WarningLogo>
              </DelayedProgress>
            </ProgressBarInnerWrapper>
            <StatusMsgContainer>
              <StatusWrapper>
                <OrangeClockIcon size={16} />
                <StatusMsg>
                  Order Status: <strong>Your limit price is out of market.</strong>{' '}
                  {isCancellable ? (
                    <>
                      {' '}
                      You can wait or <CancelButton chainId={chainId} activityDerivedState={activityDerivedState} />
                    </>
                  ) : null}
                </StatusMsg>
              </StatusWrapper>
              <StatusGraph>
                <img src={cowMeditatingGraph} alt="Cow meditating ..." className="meditating-cow" />
                {/*<p>
                  Current price: <strong>$1200.56</strong>
                </p>
                <p>
                  Your price: $1300.55 (<span>+8%</span>)
                </p>*/}
                <p>
                  <strong>CoW Swap</strong> won&apos;t charge you if the trade is reverted or if you cancel.
                </p>
              </StatusGraph>
            </StatusMsgContainer>
          </>
        )
      }
      case 'delayed': {
        return (
          <>
            <ProgressBarInnerWrapper>
              <DelayedProgress percentage={percentage}>
                <WarningLogo>
                  <img src={loadingCowWebp} alt="Loading prices..." />
                </WarningLogo>
              </DelayedProgress>
            </ProgressBarInnerWrapper>
            <StatusMsgContainer>
              <StatusWrapper>
                <OrangeClockIcon size={16} />
                <StatusMsg>
                  Order Status:{' '}
                  <strong>The network looks slower than usual. Our solvers are adjusting gas fees for you!</strong>
                  {isCancellable ? (
                    <>
                      {' '}
                      You can wait or <CancelButton chainId={chainId} activityDerivedState={activityDerivedState} />
                    </>
                  ) : null}
                </StatusMsg>
              </StatusWrapper>
              <StatusGraph>
                <img src={cowMeditatingGraph} alt="Cow meditating ..." className="meditating-cow" />
                <p>
                  <strong>CoW Swap</strong> won&apos;t charge you if the trade is reverted or if you cancel.
                </p>
              </StatusGraph>
            </StatusMsgContainer>
          </>
        )
      }
      default: {
        return null
      }
    }
  }

  return progressAndMessage()
}

export default ContentByExecutionState
