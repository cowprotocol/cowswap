import { useEffect, useMemo } from 'react'

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
import Cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import klay from 'cytoscape-klay'
import noOverlap from 'cytoscape-no-overlap'
import popper from 'cytoscape-popper'
import CytoscapeComponent from 'react-cytoscapejs'
import styled from 'styled-components/macro'

import { useCytoscape, useTxBatchData, useVisualization } from './hooks'
import { LAYOUTS } from './layouts'
import { DropdownWrapper, FloatingWrapper, LayoutButton, ResetButton, STYLESHEET } from './styled'
import { LayoutNames, ViewType } from './types'
import { removePopper } from './utils'

import { Order } from '../../../api/operator'
import { LoadingWrapper } from '../../../components/common/LoadingWrapper'
import { usePrevious } from '../../../hooks/usePrevious'
import { Network } from '../../../types'
import { DropdownOption, DropdownPosition } from '../common/Dropdown'

// eslint-disable-next-line react-hooks/rules-of-hooks
Cytoscape.use(popper)
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
const iconDice = [faDiceOne, faDiceTwo, faDiceThree, faDiceFour, faDiceFive]

function DropdownButtonContent({
  label,
  icon,
  open,
}: {
  label: string
  icon: IconDefinition
  open?: boolean
}): React.ReactNode {
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
export function TransactionBatchGraph(params: GraphBatchTxParams): React.ReactNode {
  const { orders, networkId, txHash } = params
  const { visualization, onChangeVisualization } = useVisualization()

  const txBatchData = useTxBatchData(networkId, orders, txHash, visualization)

  const { isLoading } = txBatchData

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

  const previousVisualization = usePrevious(visualization)

  const visualizationChanged = previousVisualization !== visualization

  useEffect(() => {
    if (visualizationChanged) setResetZoom(true)
  }, [setResetZoom, visualizationChanged])

  const currentLayoutIndex = Object.keys(LayoutNames).findIndex((nameLayout) => nameLayout === layout.name)

  const stylesheet = useMemo(() => {
    return STYLESHEET().concat(tokensStylesheets)
  }, [tokensStylesheets])

  if (isLoading) {
    return <LoadingWrapper message="Loading transaction graph" />
  }

  if (failedToLoadGraph) {
    return <p>Failed to load graph, please try again later</p>
  }

  return (
    <div id="tx-graph" style={{ flex: 1 }}>
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
            currentItem={currentLayoutIndex}
            dropdownButtonContent={
              <DropdownButtonContent
                icon={iconDice[currentLayoutIndex]}
                label={`Layout: ${LayoutNames[layout.name]}`}
              />
            }
            dropdownButtonContentOpened={
              <DropdownButtonContent
                icon={iconDice[currentLayoutIndex]}
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
    </div>
  )
}
