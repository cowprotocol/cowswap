import { useEffect, useState } from 'react'

import progressBarStep1 from '@cowprotocol/assets/cow-swap/progress-bar-step1.png'
import progressBarStep1a from '@cowprotocol/assets/cow-swap/progress-bar-step1a.png'
import progressBarStep2a from '@cowprotocol/assets/cow-swap/progress-bar-step2a.png'
import progressBarStep2b from '@cowprotocol/assets/cow-swap/progress-bar-step2b.png'
import progressBarStep3 from '@cowprotocol/assets/cow-swap/progress-bar-step3.png'
import { isSellOrder } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenAmount } from '@cowprotocol/ui'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useTransition } from '@react-spring/web'
import ms from 'ms.macro'
import styled from 'styled-components/macro'
import useSWR from 'swr'

import { ActivityDerivedState } from 'modules/account/containers/Transaction'

import { getOrderStatus, OrderStatus } from 'api/cowProtocol/api'
import { Stepper, StepProps } from 'common/pure/Stepper'

import { ProgressBarWrapper } from './styled'

import { AMM_LOGOS } from '../AMMsLogo'

type OrderProgressBarProps = {
  activityDerivedState: ActivityDerivedState
  chainId: SupportedChainId
  hideWhenFinished?: boolean
  hash?: string
}

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
  const [countdown, setCountdown] = useState<number | null>(null)
  const { data: orderStatus } = useOrderStatus(chainId, orderId)

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    if (countdown) {
      timer = setInterval(
        () => countdown < Date.now() && setState((curr) => (curr === 'solving' ? 'delayed' : curr)),
        ms`1s`
      )
    }

    return () => timer && clearTimeout(timer)
  }, [countdown])

  useEffect(() => {
    if (isUnfillable) {
      setState('unfillable')
    } else if (!orderStatus || orderStatus.type === 'scheduled' || orderStatus.type === 'open') {
      // setState('initial')
      // TODO: think about what to do when we come back to this state
    } else if (orderStatus.type === 'active') {
      setState('solving')
      setCountdown(Date.now() + ms`15s`)
    } else if (orderStatus.type === 'solved' || orderStatus.type === 'executing') {
      setState('executing')
    } else if (orderStatus.type === 'traded' || isConfirmed) {
      setState('finished')
    } else if (orderStatus.type === 'cancelled') {
      setState('unfillable')
    }
  }, [isConfirmed, isUnfillable, orderStatus])

  return { state, value: orderStatus?.value }
}

const SWR_OPTIONS = {
  refreshInterval: ms`1s`,
}

function useOrderStatus(chainId: SupportedChainId, orderId: string) {
  return useSWR(
    chainId && orderId ? ['getOrderStatus', chainId, orderId] : null,
    async ([, _chainId, _orderId]) => getOrderStatus(_chainId, _orderId),
    SWR_OPTIONS
  )
}

const ProgressImage = styled.img`
  width: 100%;
`

function CountDown() {
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => (c > 1 ? c - 1 : 0)), ms`1s`)

    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <strong style={{ alignSelf: 'center', fontSize: '5em' }}>{countdown}</strong>
      <p>The auction has started! Solvers are competing to find the best solution for you...</p>
    </div>
  )
}

const steps: StepProps[] = [
  { stepState: 'open', stepNumber: 1, label: 'placing' },
  { stepState: 'open', stepNumber: 2, label: 'solving' },
  { stepState: 'open', stepNumber: 3, label: 'executing' },
  { stepState: 'open', stepNumber: 4, label: 'done' },
]

export function OrderProgressBar(props: OrderProgressBarProps) {
  const { activityDerivedState, chainId, hideWhenFinished = false } = props
  const { order, isConfirmed, isUnfillable = false } = activityDerivedState

  const { state: newState, value: solverCompetition } = useProgressBarState(
    chainId,
    order?.id || '',
    isUnfillable,
    isConfirmed
  )
  const isSmartContractWallet = useIsSmartContractWallet()

  // TODO: add it to delayed orders
  // const getShowCancellationModal = useCancelOrder()
  // const showCancellationModal = order ? getShowCancellationModal(order) : null

  const fadeOutTransition = useTransition(true, {
    from: { opacity: 1 },
    leave: { opacity: 0 },
    trail: 3000,
  })

  const progressBar = () => {
    switch (newState) {
      case 'initial': {
        const localSteps = [...steps]
        localSteps[0].stepState = 'loading'
        return (
          <div>
            <ProgressImage src={progressBarStep1} alt="" />
            <p>Your order has been submitted and will be included in the next solver auction.</p>
            <Stepper steps={localSteps} />
          </div>
        )
      }
      case 'solving': {
        const localSteps = [...steps]
        localSteps[0].stepState = 'finished'
        localSteps[1].stepState = 'loading'
        return (
          <>
            <CountDown />
            <Stepper steps={localSteps} />
          </>
        )
      }
      case 'executing': {
        const localSteps = [...steps]
        localSteps[0].stepState = 'finished'
        localSteps[1].stepState = 'finished'
        localSteps[2].stepState = 'loading'
        return (
          <div>
            <ProgressImage src={progressBarStep3} alt="" />
            <p>
              <strong>
                {solverCompetition?.length} solver{solverCompetition && solverCompetition?.length > 1 && 's'} joined the
                competition!
              </strong>
            </p>
            <p>The winner is submitting your order on-chain...</p>
            <Stepper steps={localSteps} />
          </div>
        )
      }
      case 'finished': {
        const localSteps = [...steps]
        localSteps[0].stepState = 'finished'
        localSteps[1].stepState = 'finished'
        localSteps[2].stepState = 'finished'
        localSteps[3].stepState = 'finished'

        const isSell = order && isSellOrder(order.kind)
        const displayToken = isSell ? order?.outputToken : order?.inputToken
        const solution = solverCompetition && solverCompetition[0]
        const displayAmount =
          displayToken &&
          solution &&
          CurrencyAmount.fromRawAmount(displayToken, isSell ? solution?.buyAmount : solution?.sellAmount)
        return (
          <div>
            <span>
              You {isSell ? 'received' : 'sold'} <TokenAmount amount={displayAmount} tokenSymbol={displayToken} />!
            </span>

            <p>Solver ranking</p>
            <ol>
              {solverCompetition?.map((entry) => {
                const imageProps = AMM_LOGOS[entry.solver] || AMM_LOGOS.default

                return (
                  <li key={entry.solver}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img
                        style={{ height: '20px', width: '20px', marginRight: '5px' }}
                        {...imageProps}
                        alt="Solver logo"
                      />
                      <span>{entry.solver}</span>
                    </div>
                  </li>
                )
              })}
            </ol>
            {/*{solverCompetition && solverCompetition.length > 1 && (*/}
            {/*  <p>*/}
            {/*    You would have gotten {solverCompetition[1].sellAmount} / {solverCompetition[1].sellAmount} on{' '}*/}
            {/*    {solverCompetition[1].solver}!*/}
            {/*  </p>*/}
            {/*)}*/}
            <Stepper steps={localSteps} />
          </div>
        )
      }
      case 'unfillable': {
        const localSteps = [...steps]
        localSteps[0].stepState = 'error'
        return (
          <div>
            <ProgressImage src={progressBarStep1a} alt="" />
            <p>Your order’s price is currently out of market. You can wait or cancel the order.</p>
            <Stepper steps={localSteps} />
          </div>
        )
      }
      case 'delayed': {
        const localSteps = [...steps]
        localSteps[0].stepState = 'finished'
        localSteps[1].stepState = 'loading'
        return (
          <div>
            <ProgressImage src={progressBarStep2a} alt="" />
            <p>This is taking longer than expected! Solvers are still searching...</p>
            <Stepper steps={localSteps} />
          </div>
        )
      }
      case 'submissionFailed': {
        const localSteps = [...steps]
        localSteps[0].stepState = 'loading'
        return (
          <div>
            <ProgressImage src={progressBarStep2b} alt="" />
            <p>The order could not be settled on-chain. Solvers are competing to find a new solution...</p>
            <Stepper steps={localSteps} />
          </div>
        )
      }
      default:
        return null
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
