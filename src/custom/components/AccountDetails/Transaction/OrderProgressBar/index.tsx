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
import { CancelButton } from '../CancelButton'

const COW_STATE_PERCENTAGE = 0.33 // 33% of the elapsed time based on the network's average is for the COW protocol

type OrderProgressBarProps = {
  activityDerivedState: ActivityDerivedState
  creationTime: Date
  validTo: Date
  chainId: SupportedChainId
}

type ExecutionState = 'cow' | 'amm' | 'confirmed' | 'unfillable' | 'delayed'

export function OrderProgressBar(props: OrderProgressBarProps) {
  const { activityDerivedState, creationTime, validTo, chainId } = props
  const { isConfirmed, isPending, isCancellable, isUnfillable = false } = activityDerivedState

  const elapsedSeconds = (Date.now() - creationTime.getTime()) / 1000
  const expirationInSeconds = (validTo.getTime() - creationTime.getTime()) / 1000

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
    }, 1000)

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
    } else if (elapsedSeconds <= EXPECTED_EXECUTION_TIME[chainId] * COW_STATE_PERCENTAGE) {
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
              <GreenClockIcon size={16} />
              <StatusMsg>Looking for a CoW.</StatusMsg>
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
                <WarningLogo />
              </WarningProgress>
            </ProgressBarInnerWrapper>
            <StatusMsgContainer>
              <WarningIcon size={16} />
              <StatusMsg> Your order is taking longer than usual.</StatusMsg>
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
