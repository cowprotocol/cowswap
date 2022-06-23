import { useEffect, useMemo, useState } from 'react'
import { useTransition } from 'react-spring'
import {
  ProgressBarWrapper,
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
} from './styled'
import { AMMsLogo } from 'components/AMMsLogo'
import { EXPECTED_EXECUTION_TIME, getPercentage } from './utils'
import { SupportedChainId } from 'constants/chains'
import { ActivityDerivedState } from '../index'
import { CancelButton } from '../CancelButton'
import loadingCowGif from 'assets/cow-swap/cow-load.gif'
import cowGraph from 'assets/images/cow-graph.svg'
import ammsGraph from 'assets/images/amms-graph.svg'
import cowMeditatingGraph from 'assets/images/cow-meditating.svg'

import { ExternalLink } from 'theme'
// import { ExplorerDataType, getExplorerLink } from '@src/utils/getExplorerLink'

const REFRESH_INTERVAL_MS = 200
const COW_STATE_SECONDS = 30

type OrderProgressBarProps = {
  activityDerivedState: ActivityDerivedState
  chainId: SupportedChainId
}

type ExecutionState = 'cow' | 'amm' | 'confirmed' | 'unfillable' | 'delayed'

export function OrderProgressBar(props: OrderProgressBarProps) {
  const { activityDerivedState, chainId } = props
  const { order, isConfirmed, isCancellable, isUnfillable = false } = activityDerivedState
  const { validTo, creationTime } = useMemo(() => {
    if (order) {
      return {
        validTo: new Date((order.validTo as number) * 1000),
        creationTime: new Date(order.creationTime),
      }
    }

    return {
      validTo: null,
      creationTime: null,
    }
  }, [order])
  const { elapsedSeconds, expirationInSeconds, isPending } = useGetProgressBarInfo({
    activityDerivedState,
    validTo,
    creationTime,
  })
  const [executionState, setExecutionState] = useState<ExecutionState>('cow')
  const [percentage, setPercentage] = useState(getPercentage(elapsedSeconds, expirationInSeconds, chainId))

  const fadeOutTransition = useTransition(isPending, null, {
    from: { opacity: 1 },
    leave: { opacity: 0 },
    trail: 3000,
  })

  useEffect(() => {
    if (!isPending) {
      return
    }

    const id = setInterval(() => {
      const percentage = getPercentage(elapsedSeconds, expirationInSeconds, chainId)
      setPercentage(percentage)
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(id)
  }, [creationTime, validTo, chainId, elapsedSeconds, expirationInSeconds, isPending])

  useEffect(() => {
    if (isConfirmed) {
      setPercentage(100)
    }
  }, [isConfirmed])

  useEffect(() => {
    if (isConfirmed) {
      setExecutionState('confirmed')
    } else if (isUnfillable) {
      setExecutionState('unfillable')
    } else if (elapsedSeconds <= COW_STATE_SECONDS) {
      setExecutionState('cow')
    } else if (elapsedSeconds <= EXPECTED_EXECUTION_TIME[chainId]) {
      setExecutionState('amm')
    } else {
      setExecutionState('delayed')
    }
  }, [elapsedSeconds, isConfirmed, isUnfillable, chainId])

  const progressBar = () => {
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
                  <ExternalLink href="https://docs.cow.fi/overview/coincidence-of-wants">
                    <strong>
                      <span>C</span>oincidence <span>o</span>f <span>W</span>ants (CoW)
                    </strong>
                  </ExternalLink>{' '}
                  ↗
                </StatusMsg>
              </StatusWrapper>
              <StatusGraph>
                <img src={cowGraph} alt="Loading for a CoW..." />
                <p>
                  <strong>CowSwap</strong> can save you gas costs and get a better price if another trader takes the
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
                <img src={ammsGraph} alt="Finding the best price ..." />
                <p>
                  <strong>CowSwap</strong> searches all on-chain liquidity sources to find you the best price.
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
                <img src={cowMeditatingGraph} alt="Cow meditating ..." className="meditating-cow" />
                <p>
                  Your tokens should already be in your wallet, check out your trade on the{' '}
                  {/* <StyledExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}> */}
                  <StyledExternalLink href="#">explorer</StyledExternalLink> ↗
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
                  <img src={loadingCowGif} alt="Loading prices..." />
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
                      You can wait or <CancelButton chainId={chainId} activityDerivedState={activityDerivedState} />
                    </>
                  ) : null}
                </StatusMsg>
              </StatusWrapper>
              <StatusGraph>
                <p>
                  Current price: <strong>$1200.56</strong>
                </p>
                <p>
                  Your price: $1300.55 (<span>+8%</span>)
                </p>
                <p>
                  <strong>CowSwap</strong> won&apos;t charge you if the trade is reverted or if you cancel.
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
                  <img src={loadingCowGif} alt="Loading prices..." />
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
                      You can wait or <CancelButton chainId={chainId} activityDerivedState={activityDerivedState} />
                    </>
                  ) : null}
                </StatusMsg>
              </StatusWrapper>
              <StatusGraph>
                <img src={cowMeditatingGraph} alt="Cow meditating ..." className="meditating-cow" />
                <p>
                  <strong>CowSwap</strong> won&apos;t charge you if the trade is reverted or if you cancel.
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

  return (
    <>
      {fadeOutTransition.map(({ item, props, key }) => {
        return (
          item && (
            <ProgressBarWrapper key={key} style={props}>
              {progressBar()}
            </ProgressBarWrapper>
          )
        )
      })}
    </>
  )
}

type ProgressBarInfo = {
  elapsedSeconds: number
  expirationInSeconds: number
  isPending: boolean
}

type GetProgressBarInfoProps = {
  activityDerivedState: ActivityDerivedState
  creationTime: Date | null
  validTo: Date | null
}

function useGetProgressBarInfo({
  activityDerivedState,
  creationTime,
  validTo,
}: GetProgressBarInfoProps): ProgressBarInfo {
  const { isPending: orderIsPending, isPresignaturePending, order } = activityDerivedState

  if (!creationTime || !validTo) {
    return {
      elapsedSeconds: 0,
      expirationInSeconds: 0,
      isPending: false,
    }
  }

  if (order?.presignGnosisSafeTx) {
    const submissionDate = new Date(order?.presignGnosisSafeTx?.submissionDate)

    return {
      elapsedSeconds: (Date.now() - submissionDate.getTime()) / 1000,
      expirationInSeconds: (validTo.getTime() - submissionDate.getTime()) / 1000,
      isPending: orderIsPending || isPresignaturePending,
    }
  }

  return {
    elapsedSeconds: (Date.now() - creationTime.getTime()) / 1000,
    expirationInSeconds: (validTo.getTime() - creationTime.getTime()) / 1000,
    isPending: orderIsPending,
  }
}
