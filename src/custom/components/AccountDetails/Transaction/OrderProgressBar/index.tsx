import { useEffect, useState } from 'react'
import { useTransition } from 'react-spring'
import {
  ProgressBarWrapper,
  ProgressBarInnerWrapper,
  SuccessProgress,
  CowProtocolIcon,
  GreenClockIcon,
  StatusMsgContainer,
  StatusMsg,
  SwapIcon,
  OrangeClockIcon,
  PendingProgress,
  WarningProgress,
  WarningLogo,
  WarningIcon,
  GreenCheckIcon,
} from './styled'
import { AMMsLogo } from 'components/AMMsLogo'
import { EXPECTED_EXECUTION_TIME, getPercentage } from './utils'
import { SupportedChainId } from 'constants/chains'
import { ActivityDerivedState } from '../index'
import DancingCow from '@src/custom/components/DancingCow'
import { CancelButton } from '../CancelButton'
import loadingCowGif from 'assets/cow-swap/cow-load.gif'
import { ExternalLink } from 'theme'

const REFRESH_INTERVAL_MS = 200
const COW_STATE_SECONDS = 30

type OrderProgressBarProps = {
  activityDerivedState: ActivityDerivedState
  creationTime: Date
  validTo: Date
  chainId: SupportedChainId
}

type ExecutionState = 'cow' | 'amm' | 'confirmed' | 'unfillable' | 'delayed'

export function OrderProgressBar(props: OrderProgressBarProps) {
  const { activityDerivedState, creationTime, validTo, chainId } = props
  const { isConfirmed, isCancellable, isUnfillable = false } = activityDerivedState
  const { elapsedSeconds, expirationInSeconds, isPending } = useGetProgressBarInfo(props)
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
    setExecutionState('cow')

    if (isConfirmed) {
      // setExecutionState('confirmed')
      console.log('confirmed')
    } else if (isUnfillable) {
      // setExecutionState('unfillable')
      console.log('unfillable')
    } else if (elapsedSeconds <= COW_STATE_SECONDS) {
      // setExecutionState('cow')
      console.log('cow')
    } else if (elapsedSeconds <= EXPECTED_EXECUTION_TIME[chainId]) {
      // setExecutionState('amm')
      console.log('amm')
    } else {
      // setExecutionState('delayed')
      console.log('delayed')
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
              <GreenClockIcon size={16} />
              <StatusMsg>
                <p>
                  Looking for a{' '}
                  <ExternalLink href="https://docs.cow.fi/overview/coincidence-of-wants">CoW</ExternalLink> (
                  <strong>C</strong>oincidence <strong>o</strong>f <strong>W</strong>ants)
                  <br />
                  <DancingCow />
                  <SwapIcon />
                  <DancingCow />
                </p>
                <p>
                  CowSwap will be able to save in <strong>gas costs</strong> and get a <strong>better price</strong> if
                  another trader makes the opposite trade
                </p>
              </StatusMsg>
            </StatusMsgContainer>
          </>
        )
      }
      case 'amm': {
        return (
          <>
            <ProgressBarInnerWrapper>
              <PendingProgress percentage={percentage}>
                <AMMsLogo chainId={chainId} />
              </PendingProgress>
            </ProgressBarInnerWrapper>
            <StatusMsgContainer>
              <OrangeClockIcon size={16} />
              <StatusMsg>Finding best onchain price.</StatusMsg>
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
              <GreenCheckIcon size={16} />
              <StatusMsg>Transaction confirmed.</StatusMsg>
            </StatusMsgContainer>
          </>
        )
      }
      case 'unfillable': {
        return (
          <>
            <ProgressBarInnerWrapper>
              <WarningProgress percentage={percentage}>
                <WarningLogo />
              </WarningProgress>
            </ProgressBarInnerWrapper>
            <StatusMsgContainer>
              <WarningIcon size={16} />
              <StatusMsg>
                Your limit price is out of market.{' '}
                {isCancellable ? (
                  <>
                    You can wait or <CancelButton chainId={chainId} activityDerivedState={activityDerivedState} />
                  </>
                ) : null}
              </StatusMsg>
            </StatusMsgContainer>
          </>
        )
      }
      case 'delayed': {
        return (
          <>
            <ProgressBarInnerWrapper>
              <WarningProgress percentage={percentage}>
                <WarningLogo>
                  <img src={loadingCowGif} alt="Loading prices..." />
                </WarningLogo>
              </WarningProgress>
            </ProgressBarInnerWrapper>
            <StatusMsgContainer>
              <StatusMsg>
                <p>The network looks slower than usual. Solvers are adjusting gas fees for you!</p>
                {isCancellable ? (
                  <p>
                    You can wait or <CancelButton chainId={chainId} activityDerivedState={activityDerivedState} />
                  </p>
                ) : null}
              </StatusMsg>
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

function useGetProgressBarInfo({
  creationTime,
  validTo,
  activityDerivedState,
}: OrderProgressBarProps): ProgressBarInfo {
  const { isPending: orderIsPending, isPresignaturePending, order } = activityDerivedState

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
