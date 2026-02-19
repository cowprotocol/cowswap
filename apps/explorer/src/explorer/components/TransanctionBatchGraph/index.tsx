import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { Media, Color } from '@cowprotocol/ui'

import {
  faDiceFive,
  faDiceFour,
  faDiceOne,
  faDiceThree,
  faDiceTwo,
  faRedo,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Cytoscape, { Ext } from 'cytoscape'
import fcose from 'cytoscape-fcose'
import klay from 'cytoscape-klay'
import noOverlap from 'cytoscape-no-overlap'
import popper from 'cytoscape-popper'
import CytoscapeComponent from 'react-cytoscapejs'
import styled, { keyframes } from 'styled-components/macro'

import { BatchSummaryBar } from './BatchSummaryBar'
import { CompactLayout } from './CompactLayout'
import { useCytoscape, useQueryLayoutMode, useTxBatchData, useUpdateLayoutModeQuery, useVisualization } from './hooks'
import { LAYOUTS } from './layouts'
import { DropdownWrapper, FloatingWrapper, LayoutButton, ResetButton, STYLESHEET } from './styled'
import { LayoutMode, LayoutNames, ViewType } from './types'
import { removePopper } from './utils'

import { Order } from '../../../api/operator'
import { LoadingWrapper } from '../../../components/common/LoadingWrapper'
import { usePrevious } from '../../../hooks/usePrevious'
import { useSolversInfo } from '../../../hooks/useSolversInfo'
import { Network } from '../../../types'
import { SolverInfo } from '../../../utils/fetchSolversInfo'
import { DropdownOption, DropdownPosition } from '../common/Dropdown'

// eslint-disable-next-line react-hooks/rules-of-hooks
Cytoscape.use(popper as never as Ext)
// eslint-disable-next-line react-hooks/rules-of-hooks
Cytoscape.use(noOverlap)
// eslint-disable-next-line react-hooks/rules-of-hooks
Cytoscape.use(fcose)
// eslint-disable-next-line react-hooks/rules-of-hooks
Cytoscape.use(klay)

const WrapperCytoscape = styled(CytoscapeComponent)`
  background-color: ${Color.explorer_bg};
  font-weight: ${({ theme }): string => theme.fontMedium};
  border-radius: 0.6rem;
  padding-top: 3rem;

  ${Media.upToMedium()} {
    border: 0.1rem solid ${Color.explorer_border};
    margin: 1.6rem 0;
  }
`

const GraphWrapper = styled.div`
  position: relative;
`

const LoadingStatusCycle = keyframes`
  from {
    transform: translateX(-120%);
  }
  to {
    transform: translateX(220%);
  }
`

const LoadingProgressWrap = styled.div`
  margin-top: 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
`

const LoadingStatusText = styled.div`
  color: ${Color.explorer_textSecondary};
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  min-height: 1.8rem;
`

const LoadingBarTrack = styled.div`
  position: relative;
  width: min(36rem, 78vw);
  height: 0.45rem;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
`

const LoadingBarSweep = styled.div`
  position: absolute;
  inset: 0 auto 0 0;
  width: 35%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(240, 185, 11, 0.18) 0%,
    rgba(240, 185, 11, 0.95) 55%,
    rgba(46, 196, 182, 0.9) 100%
  );
  animation: ${LoadingStatusCycle} 1.4s ease-in-out infinite;
`

const iconDice = [faDiceOne, faDiceTwo, faDiceThree, faDiceFour, faDiceFive]
const GRAPH_LOADING_STAGES = [
  'Fetching settlement traces',
  'Parsing transfers and trades',
  'Detecting CoW paths',
  'Building flow layout',
]

function DropdownButtonContent({
  label,
  icon,
  open,
}: {
  label: string
  icon: IconDefinition
  open?: boolean
}): ReactNode {
  return (
    <>
      <FontAwesomeIcon icon={icon} />
      <span>{label}</span>
      <span className={`arrow ${open && 'open'}`} />
    </>
  )
}

const ViewTypeNames: Record<ViewType, string> = {
  [ViewType.TRANSFERS]: 'Transfer based',
  [ViewType.TRADES]: 'Trade based',
}

interface GraphBatchTxParams {
  orders: Order[] | undefined
  txHash: string
  networkId: Network | undefined
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function TransactionBatchGraph(params: GraphBatchTxParams): ReactNode {
  const { orders, networkId, txHash } = params
  const { visualization, onChangeVisualization } = useVisualization()
  const queryLayoutMode = useQueryLayoutMode()
  const updateLayoutModeQuery = useUpdateLayoutModeQuery()
  const [layoutMode, setLayoutMode] = useState(LayoutMode.GRAPH)
  const visualizationForData = layoutMode === LayoutMode.GRAPH ? visualization : ViewType.TRADES

  const txBatchData = useTxBatchData(networkId, orders, txHash, visualizationForData)
  const { solversInfo } = useSolversInfo(networkId)

  const { isLoading, batchInsights } = txBatchData
  const [showUsdValues, setShowUsdValues] = useState(false)
  const [autoLayoutApplied, setAutoLayoutApplied] = useState(false)
  const [autoVisualizationApplied, setAutoVisualizationApplied] = useState(false)

  const {
    elements,
    failedToLoadGraph,
    heightSize,
    layout,
    setLayout,
    setResetZoom,
    resetZoom,
    setCytoscape,
    cyPopperRef,
    tokensStylesheets,
  } = useCytoscape({ networkId, txBatchData })

  const previousVisualization = usePrevious(visualizationForData)

  const visualizationChanged = previousVisualization !== visualizationForData

  useEffect(() => {
    if (visualizationChanged) setResetZoom(true)
  }, [setResetZoom, visualizationChanged])

  useEffect(() => {
    setAutoLayoutApplied(false)
    setAutoVisualizationApplied(false)
    setShowUsdValues(false)
  }, [txHash])

  useEffect(() => {
    if (autoLayoutApplied) return
    const initialLayoutMode =
      queryLayoutMode || (batchInsights.useCompactByDefault ? LayoutMode.COMPACT : LayoutMode.GRAPH)
    setLayoutMode(initialLayoutMode)
    updateLayoutModeQuery(initialLayoutMode)
    setAutoLayoutApplied(true)
  }, [autoLayoutApplied, batchInsights.useCompactByDefault, queryLayoutMode, updateLayoutModeQuery])

  const shouldPreferTradeVisualization = batchInsights.orderCount >= 3 || batchInsights.hasPossibleCow

  useEffect(() => {
    if (autoVisualizationApplied) return
    if (layoutMode !== LayoutMode.GRAPH) return
    if (shouldPreferTradeVisualization && visualization === ViewType.TRANSFERS) {
      onChangeVisualization(ViewType.TRADES)
    }
    setAutoVisualizationApplied(true)
  }, [autoVisualizationApplied, layoutMode, onChangeVisualization, shouldPreferTradeVisualization, visualization])

  const currentLayoutIndex = Object.keys(LayoutNames).findIndex((nameLayout) => nameLayout === layout.name)
  const safeLayoutIndex = currentLayoutIndex >= 0 ? currentLayoutIndex : 0

  const stylesheet = useMemo(() => {
    return STYLESHEET().concat(tokensStylesheets)
  }, [tokensStylesheets])
  const solverLabel = useMemo(
    () => resolveSolverLabel(batchInsights.solverAddress, networkId, solversInfo),
    [batchInsights.solverAddress, networkId, solversInfo],
  )
  const onToggleLayoutMode = useCallback(
    (nextLayoutMode: LayoutMode): void => {
      setLayoutMode(nextLayoutMode)
      updateLayoutModeQuery(nextLayoutMode)
    },
    [updateLayoutModeQuery],
  )

  if (isLoading) {
    return (
      <LoadingWrapper message="Loading transaction graph">
        <TransactionGraphLoadingProgress />
      </LoadingWrapper>
    )
  }

  if (failedToLoadGraph) {
    return <p>Failed to load graph, please try again later</p>
  }

  return (
    <div id="tx-graph" style={{ flex: 1 }}>
      <BatchSummaryBar
        batchInsights={batchInsights}
        layoutMode={layoutMode}
        onToggleLayoutMode={onToggleLayoutMode}
        onToggleUsdValues={setShowUsdValues}
        showUsdValues={showUsdValues}
        solverLabel={solverLabel}
      />

      {layoutMode === LayoutMode.COMPACT ? (
        <CompactLayout
          routes={batchInsights.compactRoutes}
          cowFlow={batchInsights.cowFlow}
          dexAddress={batchInsights.dexAddress}
          dexLabel={batchInsights.dexLabel}
          hasPossibleCow={batchInsights.hasPossibleCow}
          networkId={networkId}
          showUsdValues={showUsdValues}
        />
      ) : (
        <GraphWrapper>
          <WrapperCytoscape
            elements={elements}
            layout={layout}
            style={{ width: '100%', height: heightSize }}
            stylesheet={stylesheet}
            cy={setCytoscape}
            wheelSensitivity={0.2}
            className="tx-graph"
            maxZoom={3}
            minZoom={0.1}
            zoom={1}
          />
          <FloatingWrapper>
            <ResetButton type="button" onClick={(): void => setResetZoom(!resetZoom)}>
              <FontAwesomeIcon icon={faRedo} /> <span>{layout.name === 'fcose' ? 'Re-arrange' : 'Reset'}</span>
            </ResetButton>
            <LayoutButton>
              <DropdownWrapper
                currentItem={safeLayoutIndex}
                dropdownButtonContent={
                  <DropdownButtonContent
                    icon={iconDice[safeLayoutIndex]}
                    label={`Layout: ${LayoutNames[layout.name]}`}
                  />
                }
                dropdownButtonContentOpened={
                  <DropdownButtonContent
                    icon={iconDice[safeLayoutIndex]}
                    label={`Layout: ${LayoutNames[layout.name]}`}
                    open
                  />
                }
                callback={(): void => removePopper(cyPopperRef)}
                items={Object.values(LayoutNames).map((layoutName) => (
                  <DropdownOption key={layoutName} onClick={(): void => setLayout(LAYOUTS[layoutName.toLowerCase()])}>
                    {layoutName}
                  </DropdownOption>
                ))}
                dropdownPosition={DropdownPosition.center}
              />
            </LayoutButton>
            <LayoutButton>
              <DropdownWrapper
                currentItem={visualization}
                dropdownButtonContent={
                  <DropdownButtonContent
                    icon={iconDice[visualization]}
                    label={`Visualization: ${ViewTypeNames[visualization]}`}
                  />
                }
                dropdownButtonContentOpened={
                  <DropdownButtonContent
                    icon={iconDice[visualization]}
                    label={`Visualization: ${ViewTypeNames[visualization]}`}
                    open
                  />
                }
                callback={(): void => removePopper(cyPopperRef)}
                items={Object.keys(ViewTypeNames).map((viewType) => (
                  <DropdownOption key={viewType} onClick={(): void => onChangeVisualization(Number(viewType))}>
                    {ViewTypeNames[viewType]}
                  </DropdownOption>
                ))}
                dropdownPosition={DropdownPosition.center}
              />
            </LayoutButton>
          </FloatingWrapper>
        </GraphWrapper>
      )}
    </div>
  )
}

function TransactionGraphLoadingProgress(): ReactNode {
  const [stageIndex, setStageIndex] = useState(0)
  const [dotCount, setDotCount] = useState(1)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStageIndex((currentIndex) => (currentIndex + 1) % GRAPH_LOADING_STAGES.length)
    }, 1650)

    return (): void => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDotCount((currentCount) => (currentCount % 3) + 1)
    }, 420)

    return (): void => window.clearInterval(interval)
  }, [])

  const stageLabel = `${GRAPH_LOADING_STAGES[stageIndex]}${'.'.repeat(dotCount)}`

  return (
    <LoadingProgressWrap>
      <LoadingStatusText aria-live="polite">{stageLabel}</LoadingStatusText>
      <LoadingBarTrack>
        <LoadingBarSweep />
      </LoadingBarTrack>
    </LoadingProgressWrap>
  )
}

function resolveSolverLabel(
  solverAddress: string | undefined,
  networkId: Network | undefined,
  solversInfo: SolverInfo[],
): string | undefined {
  if (!solverAddress || !networkId || !solversInfo.length) {
    return undefined
  }

  const normalizedAddress = solverAddress.toLowerCase()
  const solver = solversInfo.find((solverInfo) =>
    solverInfo.deployments.some(
      (deployment) => deployment.chainId === networkId && deployment.address?.toLowerCase() === normalizedAddress,
    ),
  )

  return solver?.displayName
}
