import React, { useEffect, useMemo } from 'react'

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
import styled, { useTheme } from 'styled-components/macro'

import { useCytoscape, useTxBatchData, useVisualization } from './hooks'
import { LAYOUTS } from './layouts'
import { DropdownWrapper, FloatingWrapper, LayoutButton, ResetButton, STYLESHEET } from './styled'
import { LayoutNames, ViewType } from './types'
import { removePopper } from './utils'

import { Order } from '../../../api/operator'
import CowLoading from '../../../components/common/CowLoading'
import { EmptyItemWrapper } from '../../../components/common/StyledUserDetailsTable'
import { usePrevious } from '../../../hooks/usePrevious'
import { media } from '../../../theme/styles/media'
import { Network } from '../../../types'
import { DropdownOption, DropdownPosition } from '../common/Dropdown'

Cytoscape.use(popper)
Cytoscape.use(noOverlap)
Cytoscape.use(fcose)
Cytoscape.use(klay)

const WrapperCytoscape = styled(CytoscapeComponent)`
  background-color: ${({ theme }): string => theme.bg1};
  font-weight: ${({ theme }): string => theme.fontMedium};
  border-radius: 0.6rem;

  padding-top: 3rem;
  ${media.mediumDown} {
    border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
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
}): JSX.Element {
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

export function TransactionBatchGraph(params: GraphBatchTxParams): JSX.Element {
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

  const theme = useTheme()
  const currentLayoutIndex = Object.keys(LayoutNames).findIndex((nameLayout) => nameLayout === layout.name)

  const stylesheet = useMemo(() => {
    return STYLESHEET(theme).concat(tokensStylesheets)
  }, [tokensStylesheets, theme])

  if (isLoading) {
    return (
      <EmptyItemWrapper>
        <CowLoading />
      </EmptyItemWrapper>
    )
  }

  if (failedToLoadGraph) {
    return (
      <EmptyItemWrapper>
        <p>Failed to load graph, please try again later</p>
      </EmptyItemWrapper>
    )
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
