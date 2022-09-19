import { useEffect, useMemo, useState } from 'react'
import { useTransition } from 'react-spring'
import { ProgressBarWrapper } from './styled'
import ContentByExectionState from 'components/OrderProgressBar/ContentByExecutionState'
import { EXPECTED_EXECUTION_TIME, getPercentage } from 'components/OrderProgressBar/utils'
import { SupportedChainId } from 'constants/chains'
import { ActivityDerivedState } from 'components/AccountDetails/Transaction'
import useIsSmartContractWallet from 'hooks/useIsSmartContractWallet'
import { useIsGnosisSafeWallet } from 'hooks/useWalletInfo'

const REFRESH_INTERVAL_MS = 200
const COW_STATE_SECONDS = 30

export type OrderProgressBarProps = {
  activityDerivedState: ActivityDerivedState
  chainId: SupportedChainId
  hideWhenFinished?: boolean
}

export type ExecutionState = 'cow' | 'amm' | 'confirmed' | 'unfillable' | 'delayed'

export function OrderProgressBar(props: OrderProgressBarProps) {
  const { activityDerivedState, chainId, hideWhenFinished = false } = props
  const { order, isConfirmed, isUnfillable = false } = activityDerivedState
  const { validTo, creationTime } = useMemo(() => {
    if (order?.creationTime && order?.validTo) {
      return {
        validTo: new Date((order?.validTo as number) * 1000),
        creationTime: new Date(order?.apiAdditionalInfo?.creationDate ?? order?.creationTime),
      }
    }

    return {
      validTo: null,
      creationTime: null,
    }
  }, [order?.apiAdditionalInfo, order?.creationTime, order?.validTo])
  const { elapsedSeconds, expirationInSeconds, isPending } = useGetProgressBarInfo({
    activityDerivedState,
    validTo,
    creationTime,
  })
  const [executionState, setExecutionState] = useState<ExecutionState>('cow')
  const [percentage, setPercentage] = useState(getPercentage(elapsedSeconds, expirationInSeconds, chainId))
  const isSmartContractWallet = useIsSmartContractWallet()
  const isGnosisSafeWallet = useIsGnosisSafeWallet()

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

  if (isSmartContractWallet && !isGnosisSafeWallet) {
    return null
  }

  return (
    <>
      {hideWhenFinished ? (
        fadeOutTransition.map(({ item, props, key }) => {
          return (
            item && (
              <ProgressBarWrapper key={key} style={props}>
                <ContentByExectionState
                  executionState={executionState}
                  percentage={percentage}
                  activityDerivedState={activityDerivedState}
                  chainId={chainId}
                />
              </ProgressBarWrapper>
            )
          )
        })
      ) : (
        <ProgressBarWrapper>
          <ContentByExectionState
            executionState={executionState}
            percentage={percentage}
            activityDerivedState={activityDerivedState}
            chainId={chainId}
          />
        </ProgressBarWrapper>
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
