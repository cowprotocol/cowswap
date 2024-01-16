import { useEffect, useMemo, useState } from 'react'

import loadingCowWebp from '@cowprotocol/assets/cow-swap/cow-load.webp'
import ammsGraphGC from '@cowprotocol/assets/images/amms-graph-gc.svg'
import ammsGraphEth from '@cowprotocol/assets/images/amms-graph.svg'
import cowGraph from '@cowprotocol/assets/images/cow-graph.svg'
import cowMeditatingSmooth from '@cowprotocol/assets/images/cow-meditating-smoooth.svg'
import cowMeditatingGraph from '@cowprotocol/assets/images/cow-meditating.svg'
import { getExplorerOrderLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useTransition } from '@react-spring/web'
import ms from 'ms.macro'

import { AMMsLogo } from 'legacy/components/AMMsLogo'
import { EXPECTED_EXECUTION_TIME, getPercentage } from 'legacy/components/OrderProgressBar/utils'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'

import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { CancelButton } from 'common/pure/CancelButton'

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
  StyledCoWLink,
} from './styled'

import { TransactionExecutedContent } from '../TransactionExecutedContent'

const REFRESH_INTERVAL_MS = ms`0.2s`
const COW_STATE_SECONDS = ms`0.03s`
const SHOW_CONFIRMED_MS = ms`4s`

type OrderProgressBarProps = {
  activityDerivedState: ActivityDerivedState
  chainId: SupportedChainId
  hideWhenFinished?: boolean
  hash?: string
}

type ExecutionState = 'cow' | 'amm' | 'confirmed' | 'unfillable' | 'delayed'

export function OrderProgressBar(props: OrderProgressBarProps) {
  const { activityDerivedState, chainId, hideWhenFinished = false, hash } = props
  const { order, isConfirmed, isUnfillable = false } = activityDerivedState
  const [showDetails, setShowDetails] = useState(false)

  const orderOpenTime = order?.openSince || order?.creationTime || order?.apiAdditionalInfo?.creationDate

  const { validTo, creationTime } = useMemo(() => {
    if (orderOpenTime && order?.validTo) {
      return {
        validTo: new Date((order?.validTo as number) * 1000),
        creationTime: new Date(orderOpenTime),
      }
    }

    return {
      validTo: null,
      creationTime: null,
    }
  }, [order?.validTo, orderOpenTime])
  const { elapsedSeconds, expirationInSeconds, isPending } = useGetProgressBarInfo({
    activityDerivedState,
    validTo,
    creationTime,
  })
  const [executionState, setExecutionState] = useState<ExecutionState>('cow')
  const [percentage, setPercentage] = useState(getPercentage(elapsedSeconds, expirationInSeconds, chainId))
  const isSmartContractWallet = useIsSmartContractWallet()

  const getShowCancellationModal = useCancelOrder()
  const showCancellationModal = order ? getShowCancellationModal(order) : null

  const fadeOutTransition = useTransition(isPending, {
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
    let timeout: NodeJS.Timeout

    if (isConfirmed) {
      setPercentage(100)

      timeout = setTimeout(() => {
        setShowDetails(true)
      }, SHOW_CONFIRMED_MS)
    } else {
      setShowDetails(false)
    }

    return () => clearTimeout(timeout)
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
                  <StyledCoWLink
                    href="https://docs.cow.fi/cow-protocol/concepts/how-it-works/coincidence-of-wants"
                    className="cowlink"
                  >
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
        if (!showDetails) {
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
                  <img src={cowMeditatingSmooth} alt="Cow Smoooth ..." />
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
        } else if (order) {
          return <TransactionExecutedContent hash={hash} chainId={chainId} order={order} />
        } else {
          return null
        }
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
                  {showCancellationModal ? (
                    <>
                      {' '}
                      You can wait or <CancelButton onClick={showCancellationModal} />
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
                  {showCancellationModal ? (
                    <>
                      {' '}
                      You can wait or <CancelButton onClick={showCancellationModal} />
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

  if (isSmartContractWallet) {
    return null
  }

  return (
    <>
      {hideWhenFinished ? (
        fadeOutTransition((props, item) => {
          return item && <ProgressBarWrapper style={props}>{progressBar()}</ProgressBarWrapper>
        })
      ) : (
        <ProgressBarWrapper>{progressBar()}</ProgressBarWrapper>
      )}
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
  const { isPending: orderIsPending, enhancedTransaction, order } = activityDerivedState

  if (!creationTime || !validTo) {
    return {
      elapsedSeconds: 0,
      expirationInSeconds: 0,
      isPending: false,
    }
  }
  const safeTransaction = enhancedTransaction?.safeTransaction || order?.presignGnosisSafeTx

  if (safeTransaction) {
    const executionDate = new Date(safeTransaction.executionDate)
    return {
      elapsedSeconds: (Date.now() - executionDate.getTime()) / 1000,
      expirationInSeconds: (validTo.getTime() - executionDate.getTime()) / 1000,
      isPending: orderIsPending,
    }
  }

  return {
    elapsedSeconds: (Date.now() - creationTime.getTime()) / 1000,
    expirationInSeconds: (validTo.getTime() - creationTime.getTime()) / 1000,
    isPending: orderIsPending,
  }
}
