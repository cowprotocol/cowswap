import { useEffect, useMemo, useState } from 'react'

import progressBarStep1 from '@cowprotocol/assets/cow-swap/progress-bar-step1.png'
import progressBarStep1a from '@cowprotocol/assets/cow-swap/progress-bar-step1a.png'
import progressBarStep2a from '@cowprotocol/assets/cow-swap/progress-bar-step2a.png'
import progressBarStep2b from '@cowprotocol/assets/cow-swap/progress-bar-step2b.png'
import progressBarStep3 from '@cowprotocol/assets/cow-swap/progress-bar-step3.png'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useTransition } from '@react-spring/web'
import ms from 'ms.macro'
import styled from 'styled-components/macro'
import useSWR from 'swr'

import { getPercentage } from 'legacy/components/OrderProgressBar/utils'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'

import { getOrderStatus, OrderStatus } from 'api/cowProtocol/api'
import { useCancelOrder } from 'common/hooks/useCancelOrder'

import { ProgressBarWrapper } from './styled'

const REFRESH_INTERVAL_MS = ms`0.2s`
const COW_STATE_SECONDS = ms`0.03s`
const SHOW_CONFIRMED_MS = ms`4s`

type OrderProgressBarProps = {
  activityDerivedState: ActivityDerivedState
  chainId: SupportedChainId
  hideWhenFinished?: boolean
  hash?: string
}

// type ExecutionState = 'cow' | 'amm' | 'confirmed' | 'unfillable' | 'delayed'
type happyPath = 'initial' | 'solving' | 'executing' | 'finished'
type errorFlow = 'nextBatch' | 'delayed' | 'unfillable' | 'submissionFailed'
type ExecutionState = happyPath | errorFlow

type ProgressBarState = {
  state: ExecutionState
  value: undefined | OrderStatus['value']
}

function useProgressBarState(
  chainId: SupportedChainId,
  orderId: string,
  isUnfillable: boolean,
  isConfirmed: boolean
): ProgressBarState {
  const [state, setState] = useState<ExecutionState>('initial')
  const [, setCount] = useState<number | null>(null)
  const { data: orderStatus } = useOrderStatus(chainId, orderId)

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined

    if (isUnfillable) {
      setState('unfillable')
    } else if (!orderStatus || orderStatus.type === 'scheduled' || orderStatus.type === 'open') {
      // setState('initial')
      // TODO: think about what to do when we come back to this state
    } else if (orderStatus.type === 'active') {
      setState('solving')
      setCount(20)
      timerId = setTimeout(
        () =>
          setCount((c) => {
            if (c === null) {
              return c
            } else if (c === 0) {
              setState('delayed')
              return null
            }
            return c - 1
          }),
        ms`1s`
      )
    } else if (orderStatus.type === 'solved' || orderStatus.type === 'executing') {
      setState('executing')
    } else if (orderStatus.type === 'traded' || isConfirmed) {
      setState('finished')
    } else if (orderStatus.type === 'cancelled') {
      setState('unfillable')
    }

    return () => timerId && clearTimeout(timerId)
  }, [isConfirmed, isUnfillable, orderStatus])

  return { state, value: orderStatus?.value }
}

function useOrderStatus(chainId: SupportedChainId, orderId: string) {
  return useSWR(`${chainId}/${orderId}/`, chainId && orderId ? () => getOrderStatus(chainId, orderId) : null, {
    refreshInterval: ms`1s`,
  })
}

const ProgressImage = styled.img`
  width: 100%;
`

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

  const { state: newState, value: solverCompetition } = useProgressBarState(
    chainId,
    order?.id || '',
    isUnfillable,
    isConfirmed
  )
  // const [executionState, setExecutionState] = useState<ExecutionState>('cow')
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

  // useEffect(() => {
  //   if (isConfirmed) {
  //     setExecutionState('confirmed')
  //   } else if (isUnfillable) {
  //     setExecutionState('unfillable')
  //   } else if (elapsedSeconds <= COW_STATE_SECONDS) {
  //     setExecutionState('cow')
  //   } else if (elapsedSeconds <= EXPECTED_EXECUTION_TIME[chainId]) {
  //     setExecutionState('amm')
  //   } else {
  //     setExecutionState('delayed')
  //   }
  // }, [elapsedSeconds, isConfirmed, isUnfillable, chainId])

  const progressBar = () => {
    switch (newState) {
      case 'initial':
        return (
          <div>
            <ProgressImage src={progressBarStep1} alt="" />
            <p>Your order has been submitted and will be included in the next solver auction.</p>
          </div>
        )
      case 'solving':
        return (
          <div>
            <span>Imagine a count down here...</span>
            <p>The auction has started! Solvers are competing to find the best solution for you...</p>
          </div>
        )
      case 'executing':
        return (
          <div>
            <ProgressImage src={progressBarStep3} alt="" />
            <p>
              {solverCompetition?.length} solvers joined the competition! The winner is submitting your order
              on-chain...
            </p>
          </div>
        )
      case 'finished':
        return (
          <div>
            <span>You received {solverCompetition && solverCompetition[0].buyAmount}!</span>

            <p>Solver ranking</p>
            <ul>
              {solverCompetition?.map((entry) => {
                return (
                  <li key={entry.solver}>
                    {entry.solver} - {entry.sellAmount} / {entry.buyAmount}
                  </li>
                )
              })}
            </ul>
            {solverCompetition && solverCompetition.length > 1 && (
              <p>
                You would have gotten {solverCompetition[1].sellAmount} / {solverCompetition[1].sellAmount} on{' '}
                {solverCompetition[1].solver}!
              </p>
            )}
          </div>
        )
      case 'unfillable':
        return (
          <div>
            <ProgressImage src={progressBarStep1a} alt="" />
            <p>Your order’s price is currently out of market. You can wait or cancel the order.</p>
          </div>
        )
      case 'delayed':
        return (
          <div>
            <ProgressImage src={progressBarStep2a} alt="" />
            <p>This is taking longer than expected! Solvers are still searching...</p>
          </div>
        )
      case 'submissionFailed':
        return (
          <div>
            <ProgressImage src={progressBarStep2b} alt="" />
            <p>The order could not be settled on-chain. Solvers are competing to find a new solution...</p>
          </div>
        )
      default:
        return null
    }

    // switch (executionState) {
    //   case 'cow': {
    //     return (
    //       <>
    //         <ProgressBarInnerWrapper>
    //           <SuccessProgress percentage={percentage}>
    //             <CowProtocolIcon />
    //           </SuccessProgress>
    //         </ProgressBarInnerWrapper>
    //         <StatusMsgContainer>
    //           <StatusWrapper>
    //             <GreenClockIcon size={16} />
    //             <StatusMsg>
    //               Order Status: <strong>Looking for a</strong>{' '}
    //               <StyledCoWLink
    //                 href="https://docs.cow.fi/cow-protocol/concepts/how-it-works/coincidence-of-wants"
    //                 className="cowlink"
    //               >
    //                 <strong>
    //                   <span>C</span>oincidence <span>o</span>f <span>W</span>ants (CoW) ↗
    //                 </strong>
    //               </StyledCoWLink>
    //             </StatusMsg>
    //           </StatusWrapper>
    //           <StatusGraph>
    //             <img src={cowGraph} alt="Loading for a CoW..." />
    //             <p>
    //               <strong>CoW Swap</strong> can save you gas costs and get a better price if another trader takes the
    //               opposite side of your trade.
    //             </p>
    //           </StatusGraph>
    //         </StatusMsgContainer>
    //       </>
    //     )
    //   }
    //   case 'amm': {
    //     return (
    //       <>
    //         <ProgressBarInnerWrapper>
    //           <SuccessProgress percentage={percentage}>
    //             <AMMsLogo chainId={chainId} />
    //           </SuccessProgress>
    //         </ProgressBarInnerWrapper>
    //         <StatusMsgContainer>
    //           <StatusWrapper>
    //             <OrangeClockIcon size={16} />
    //             <StatusMsg>
    //               Order Status: <strong>Finding the best on-chain price.</strong>
    //             </StatusMsg>
    //           </StatusWrapper>
    //           <StatusGraph>
    //             <img
    //               src={chainId === SupportedChainId.GNOSIS_CHAIN ? ammsGraphGC : ammsGraphEth}
    //               alt="Finding the best price ..."
    //             />
    //             <p>
    //               <strong>CoW Swap</strong> searches all on-chain liquidity sources to find you the best price.
    //             </p>
    //           </StatusGraph>
    //         </StatusMsgContainer>
    //       </>
    //     )
    //   }
    //   case 'confirmed': {
    //     if (!showDetails) {
    //       return (
    //         <>
    //           <ProgressBarInnerWrapper>
    //             <SuccessProgress percentage={100}>
    //               <CowProtocolIcon />
    //             </SuccessProgress>
    //           </ProgressBarInnerWrapper>
    //           <StatusMsgContainer>
    //             <StatusWrapper>
    //               <GreenCheckIcon size={16} />
    //               <StatusMsg>
    //                 <strong>Congrats! Your transaction has been confirmed successfully! 🚀 </strong>
    //               </StatusMsg>
    //             </StatusWrapper>
    //             <StatusGraph>
    //               <img src={cowMeditatingSmooth} alt="Cow Smoooth ..." />
    //               <p>
    //                 Your tokens should already be in your wallet, check out your trade on the{' '}
    //                 <StyledExternalLink href={order ? getExplorerOrderLink(chainId, order.id) : '#'}>
    //                   explorer ↗
    //                 </StyledExternalLink>{' '}
    //               </p>
    //             </StatusGraph>
    //           </StatusMsgContainer>
    //         </>
    //       )
    //     } else if (order) {
    //       return <TransactionExecutedContent hash={hash} chainId={chainId} order={order} />
    //     } else {
    //       return null
    //     }
    //   }
    //   case 'unfillable': {
    //     return (
    //       <>
    //         <ProgressBarInnerWrapper>
    //           <DelayedProgress percentage={percentage}>
    //             <WarningLogo>
    //               <img src={loadingCowWebp} alt="Loading prices..." />
    //             </WarningLogo>
    //           </DelayedProgress>
    //         </ProgressBarInnerWrapper>
    //         <StatusMsgContainer>
    //           <StatusWrapper>
    //             <OrangeClockIcon size={16} />
    //             <StatusMsg>
    //               Order Status: <strong>Your limit price is out of market.</strong>{' '}
    //               {showCancellationModal ? (
    //                 <>
    //                   {' '}
    //                   You can wait or <CancelButton onClick={showCancellationModal} />
    //                 </>
    //               ) : null}
    //             </StatusMsg>
    //           </StatusWrapper>
    //           <StatusGraph>
    //             <img src={cowMeditatingGraph} alt="Cow meditating ..." className="meditating-cow" />
    //             {/*<p>
    //               Current price: <strong>$1200.56</strong>
    //             </p>
    //             <p>
    //               Your price: $1300.55 (<span>+8%</span>)
    //             </p>*/}
    //             <p>
    //               <strong>CoW Swap</strong> won&apos;t charge you if the trade is reverted or if you cancel.
    //             </p>
    //           </StatusGraph>
    //         </StatusMsgContainer>
    //       </>
    //     )
    //   }
    //   case 'delayed': {
    //     return (
    //       <>
    //         <ProgressBarInnerWrapper>
    //           <DelayedProgress percentage={percentage}>
    //             <WarningLogo>
    //               <img src={loadingCowWebp} alt="Loading prices..." />
    //             </WarningLogo>
    //           </DelayedProgress>
    //         </ProgressBarInnerWrapper>
    //         <StatusMsgContainer>
    //           <StatusWrapper>
    //             <OrangeClockIcon size={16} />
    //             <StatusMsg>
    //               Order Status:{' '}
    //               <strong>The network looks slower than usual. Our solvers are adjusting gas fees for you!</strong>
    //               {showCancellationModal ? (
    //                 <>
    //                   {' '}
    //                   You can wait or <CancelButton onClick={showCancellationModal} />
    //                 </>
    //               ) : null}
    //             </StatusMsg>
    //           </StatusWrapper>
    //           <StatusGraph>
    //             <img src={cowMeditatingGraph} alt="Cow meditating ..." className="meditating-cow" />
    //             <p>
    //               <strong>CoW Swap</strong> won&apos;t charge you if the trade is reverted or if you cancel.
    //             </p>
    //           </StatusGraph>
    //         </StatusMsgContainer>
    //       </>
    //     )
    //   }
    //   default: {
    //     return null
    //   }
    // }
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
