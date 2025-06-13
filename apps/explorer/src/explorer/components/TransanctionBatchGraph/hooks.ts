import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Cytoscape, { EdgeDataDefinition, ElementDefinition, NodeDataDefinition, StylesheetCSS } from 'cytoscape'

import { LAYOUTS } from './layouts'
import { buildContractViewNodes, buildTokenViewNodes, getTokenAddress } from './nodesBuilder'
import { BuildSettlementParams, buildTradesBasedSettlement, buildTransfersBasedSettlement } from './settlementBuilder'
import { CustomLayoutOptions, GetTxBatchTradesResult, PopperInstance, ViewType } from './types'
import { bindPopper, removePopper, updateLayout } from './utils'

import { Order } from '../../../api/operator'
import { traceToTransfersAndTrades } from '../../../api/tenderly'
import UnknownToken from '../../../assets/img/question1.svg'
import { useMultipleErc20 } from '../../../hooks/useErc20'
import { useQuery, useUpdateQueryString } from '../../../hooks/useQuery'
import { useTransactionData } from '../../../hooks/useTransactionData'
import useWindowSizes from '../../../hooks/useWindowSizes'
import { Network } from '../../../types'
import { getImageUrl } from '../../../utils'
import { HEIGHT_HEADER_FOOTER } from '../../const'

export type UseCytoscapeParams = {
  txBatchData: GetTxBatchTradesResult
  networkId: Network | undefined
}

export type UseCytoscapeReturn = {
  elements: ElementDefinition[]
  failedToLoadGraph: boolean
  heightSize: number | undefined
  resetZoom: boolean | null
  setResetZoom: (resetZoom: boolean | null) => void
  setCytoscape: (ref: Cytoscape.Core | null) => void
  layout: CustomLayoutOptions
  setLayout: (layout: CustomLayoutOptions) => void
  cyPopperRef: React.MutableRefObject<PopperInstance | null>
  tokensStylesheets: StylesheetCSS[]
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useCytoscape(params: UseCytoscapeParams): UseCytoscapeReturn {
  const {
    txBatchData: { error, isLoading, txSettlement },
    networkId,
  } = params

  const [elements, setElements] = useState<ElementDefinition[]>([])
  const cytoscapeRef = useRef<Cytoscape.Core | null>(null)
  const cyPopperRef = useRef<PopperInstance | null>(null)
  const [resetZoom, setResetZoom] = useState<boolean | null>(null)
  const [layout, setLayout] = useState(LAYOUTS.grid)
  const { innerHeight } = useWindowSizes()
  const heightSize = innerHeight && innerHeight - HEIGHT_HEADER_FOOTER
  const [failedToLoadGraph, setFailedToLoadGraph] = useState(false)
  const [tokensStylesheets, setTokensStylesheets] = useState<StylesheetCSS[]>([])

  const setCytoscape = useCallback(
    (ref: Cytoscape.Core | null) => {
      cytoscapeRef.current = ref

      if (ref) {
        ref.removeListener('resize')
        ref.on('resize', () => {
          updateLayout(ref, layout.name, true)
        })
      }
    },
    [layout.name],
  )

  const stableTxSettlement = JSON.stringify(txSettlement)

  useEffect(() => {
    try {
      setFailedToLoadGraph(false)
      const cy = cytoscapeRef.current
      setElements([])
      if (error || isLoading || !networkId || !heightSize || !cy || !txSettlement) return

      const getNodesFn = txSettlement.contractTrades ? buildTokenViewNodes : buildContractViewNodes
      const nodes = getNodesFn(txSettlement, networkId, heightSize, layout.name)

      setTokensStylesheets(getStylesheets(nodes))
      setElements(nodes)
      if (resetZoom) {
        updateLayout(cy, layout.name)
      }
      removePopper(cyPopperRef)
      setResetZoom(null)
    } catch (e) {
      console.error(`Failed to build graph`, e)
      setFailedToLoadGraph(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isLoading, stableTxSettlement, networkId, heightSize, resetZoom, layout.name])

  useEffect(() => {
    const cy = cytoscapeRef.current
    if (!cy || !elements.length) return

    cy.on('mouseover touchstart', 'edge', (event): void => {
      const target = event.target
      const targetData: NodeDataDefinition | EdgeDataDefinition = target.data()

      bindPopper(event, targetData, cyPopperRef)
    })
    cy.on('mouseover', 'edge', (event): void => {
      event.target.addClass('hover')
      document.getElementById('tx-graph')?.classList.add('hover')
    })
    cy.on('mouseout', 'edge', (event): void => {
      event.target.removeClass('hover')
      document.getElementById('tx-graph')?.classList.remove('hover')
    })
    cy.on('mouseover touchstart', 'node', (event): void => {
      const target = event.target
      const targetData: NodeDataDefinition | EdgeDataDefinition = target.data()

      bindPopper(event, targetData, cyPopperRef)
    })
    cy.on('mouseover', 'node', (event): void => {
      if (event.target.data('href')) {
        event.target.addClass('hover')
        document.getElementById('tx-graph')?.classList.add('hover')
      }
    })
    cy.on('mouseout', 'node', (event): void => {
      event.target.removeClass('hover')
      document.getElementById('tx-graph')?.classList.remove('hover')
    })
    cy.on('tap', 'node', (event): void => {
      const href = event.target.data('href')
      href && window.open(href, '_blank')
    })
    cy.nodes().noOverlap({ padding: 5 })

    return (): void => {
      cy.removeAllListeners()
      document.getElementById('tx-graph')?.classList.remove('hover')
      removePopper(cyPopperRef)
    }
  }, [cytoscapeRef, elements.length])

  return useMemo(
    () => ({
      failedToLoadGraph,
      heightSize,
      resetZoom,
      setResetZoom,
      setCytoscape,
      layout,
      setLayout,
      cyPopperRef,
      elements,
      tokensStylesheets,
    }),
    [
      failedToLoadGraph,
      heightSize,
      resetZoom,
      setResetZoom,
      setCytoscape,
      layout,
      setLayout,
      cyPopperRef,
      elements,
      tokensStylesheets,
    ],
  )
}

function getStylesheets(
  nodes: ElementDefinition[],
  // networkId: SupportedChainId,
): StylesheetCSS[] {
  const stylesheets: StylesheetCSS[] = []

  nodes.forEach((node) => {
    if (node.data.type === 'token') {
      // Right now unknown token image will only be used when the address is undefined
      // which is not likely
      // A way to deal with this would be to first fetch the image and when it fails set the fallback image
      const image = getImageUrl(node.data.address) || UnknownToken

      stylesheets.push({
        selector: `node[id="${node.data.id}"]`,
        css: {
          // It's in theory possible to pass multiple images as a fallback, but when that's done,
          // the image sizes are broken, going over the image bounds
          'background-image': `url("${image}")`,
          'background-color': 'white',
          'background-fit': 'contain',
          // These settings are not respected as far as I tried
          // 'background-width': 20,
          // 'background-height': 20,
        },
      })
    }
  })

  return stylesheets
}

const DEFAULT_VIEW_TYPE = ViewType.TRANSFERS
const DEFAULT_VIEW_NAME = ViewType[DEFAULT_VIEW_TYPE]

const VISUALIZATION_PARAM_NAME = 'vis'

function useQueryViewParams(): string {
  const query = useQuery()
  return query.get(VISUALIZATION_PARAM_NAME)?.toUpperCase() || DEFAULT_VIEW_NAME
}

function useUpdateVisQuery(): (vis: string) => void {
  const updateQueryString = useUpdateQueryString()

  return useCallback((vis: string) => updateQueryString(VISUALIZATION_PARAM_NAME, vis), [updateQueryString])
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useTxBatchData(
  networkId: Network | undefined,
  orders: Order[] | undefined,
  txHash: string,
  visualization: ViewType,
): GetTxBatchTradesResult {
  // Fetch data from tenderly
  const txData = useTransactionData(networkId, txHash)

  // Parse data into trades and transfers
  const { trades, transfers } = useMemo(() => {
    if (!txData.trace) {
      return { trades: [], transfers: [] }
    }

    return traceToTransfersAndTrades(txData.trace)
  }, [txData.trace])

  // Extract tokens from orders
  const orderTokens = useMemo(
    () =>
      orders?.reduce((acc, order) => {
        if (order.sellToken) acc[order.sellToken.address.toLowerCase()] = order.sellToken
        if (order.buyToken) acc[order.buyToken.address.toLowerCase()] = order.buyToken

        return acc
      }, {}) || {},
    [orders],
  )

  // Collect addresses of missing tokens which were not part of any order
  const missingTokensAddresses = useMemo(() => {
    const addressesSet = transfers.reduce((set, transfer) => {
      const tokenAddress = getTokenAddress(transfer.token, networkId || 1)

      if (!orderTokens[tokenAddress]) {
        set.add(tokenAddress)
      }

      return set
    }, new Set<string>())

    return Array.from(addressesSet)
  }, [networkId, orderTokens, transfers])

  // Load missing tokens data
  const { isLoading: areTokensLoading, value: missingTokens } = useMultipleErc20({
    addresses: missingTokensAddresses,
    networkId,
  })

  // Build settlement object
  const txSettlement = useMemo(() => {
    const params: BuildSettlementParams = {
      networkId,
      tokens: { ...orderTokens, ...missingTokens },
      txData,
      orders,
      trades,
      transfers,
    }

    return visualization === ViewType.TRADES
      ? buildTradesBasedSettlement(params)
      : buildTransfersBasedSettlement(params)
  }, [networkId, orderTokens, missingTokens, txData, orders, trades, transfers, visualization])

  return useMemo(
    () => ({ txSettlement, error: txData.error, isLoading: txData.isLoading || areTokensLoading }),
    [txSettlement, txData.error, txData.isLoading, areTokensLoading],
  )
}

type UseVisualizationReturn = {
  visualization: ViewType
  onChangeVisualization: (vis: ViewType) => void
}

export function useVisualization(): UseVisualizationReturn {
  const visualization = useQueryViewParams()

  const updateVisQuery = useUpdateVisQuery()

  const [visualizationViewSelected, setVisualizationViewSelected] = useState<ViewType>(
    ViewType[visualization] || DEFAULT_VIEW_TYPE,
  )

  const onChangeVisualization = useCallback((viewName: ViewType) => setVisualizationViewSelected(viewName), [])

  useEffect(() => {
    updateVisQuery(ViewType[visualizationViewSelected].toLowerCase())
  }, [updateVisQuery, visualizationViewSelected])

  return { visualization: visualizationViewSelected, onChangeVisualization }
}
