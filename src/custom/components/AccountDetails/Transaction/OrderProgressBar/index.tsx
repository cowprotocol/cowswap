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
import { LinkStyledButton } from '@src/theme'
import { SupportedChainId } from 'constants/chains'

type OrderProgressBarProps = {
  creationTime: Date
  validTo: Date
  isUnfillable?: boolean
  isCancellable?: boolean
  isConfirmed: boolean
  chainId: SupportedChainId
}

export function OrderProgressBar(props: OrderProgressBarProps) {
  const { creationTime, validTo, isUnfillable = false, isCancellable = false, isConfirmed, chainId } = props
  const [percentage, setPercentage] = useState(1)
  const transitions = useTransition(!isConfirmed, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    trail: 3000,
  })

  const elapsedSeconds = (Date.now() - creationTime.getTime()) / 1000

  useEffect(() => {
    if (isConfirmed) {
      return
    }

    const id = setInterval(() => {
      const expirationInSeconds = (validTo.getTime() - creationTime.getTime()) / 1000
      const percentage = getPercentage(elapsedSeconds, expirationInSeconds, chainId)
      setPercentage(percentage)
    }, 1000)

    return () => clearInterval(id)
  }, [creationTime, validTo, chainId, elapsedSeconds, isConfirmed])

  useEffect(() => {
    if (isConfirmed) {
      setPercentage(100)
    }
  }, [isConfirmed])

  const progressBar = () => {
    if (isConfirmed) {
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

    if (elapsedSeconds <= EXPECTED_EXECUTION_TIME[chainId] * 0.33) {
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
    } else if (elapsedSeconds <= EXPECTED_EXECUTION_TIME[chainId] * 0.66) {
      return (
        <>
          <ProgressBarInnerWrapper>
            <PendingProgress percentage={percentage}>
              <AMMsLogo />
            </PendingProgress>
          </ProgressBarInnerWrapper>
          <StatusMsgContainer>
            <OrangeClockIcon size={16} />
            <StatusMsg>Finding best onchain price.</StatusMsg>
          </StatusMsgContainer>
        </>
      )
    } else {
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
  }

  return (
    <>
      {transitions.map(({ item, props, key }) => {
        return (
          item && (
            <ProgressBarWrapper key={key} style={props}>
              {isUnfillable ? (
                <>
                  <ProgressBarInnerWrapper>
                    <WarningProgress percentage={percentage}>
                      <WarningLogo />
                    </WarningProgress>
                  </ProgressBarInnerWrapper>
                  <StatusMsgContainer>
                    <WarningIcon size={16} />
                    <StatusMsg>
                      Your limit price is out of market. You can wait or
                      <LinkStyledButton>Cancel order</LinkStyledButton>
                    </StatusMsg>
                  </StatusMsgContainer>
                </>
              ) : (
                progressBar()
              )}
            </ProgressBarWrapper>
          )
        )
      })}
    </>
  )
}
