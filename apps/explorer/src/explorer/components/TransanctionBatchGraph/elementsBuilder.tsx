import { ElementDefinition } from 'cytoscape'

import { InfoTooltip, Node, TypeEdgeOnTx, TypeNodeOnTx } from './types'

export default class ElementsBuilder {
  _center: ElementDefinition | null = null
  _nodes: ElementDefinition[] = []
  _edges: ElementDefinition[] = []
  _SIZE: number
  _countNodeTypes: Map<string, number>
  _countEdgeDirection: Map<string, number>

  constructor(heighSize?: number) {
    this._SIZE = heighSize || 600
    this._countNodeTypes = new Map()
    this._countEdgeDirection = new Map()
  }

  _increaseCountNodeType = (_type: string): void => {
    const count = this._countNodeTypes.get(_type) || 0
    this._countNodeTypes.set(_type, count + 1)
  }

  _increaseCountEdgeDirection = (sourceName: string, targetName: string): void => {
    const idDirection = `${sourceName}-${targetName}`
    const count = this._countEdgeDirection.get(idDirection) || 0
    this._countEdgeDirection.set(idDirection, count + 1)
  }

  _createNodeElement = (node: Node, parent?: string, hideLabel?: boolean, tooltip?: InfoTooltip): ElementDefinition => {
    this._increaseCountNodeType(node.type)
    return {
      group: 'nodes',
      data: {
        address: node.id,
        id: `${node.type}:${node.id}`,
        label: !hideLabel ? node.entity.alias : '',
        type: node.type,
        parent: parent ? `${TypeNodeOnTx.NetworkNode}:${parent}` : undefined,
        tooltip,
        href: node.entity.href,
      },
    }
  }

  center(node: Node, parent?: string): this {
    this._center = this._createNodeElement(node, parent)
    return this
  }

  node(node: Node, parent?: string, tooltip?: InfoTooltip): this {
    const GROUP_NODE_NAME = 'group'
    this._nodes.push(this._createNodeElement(node, parent, node.id.includes(GROUP_NODE_NAME), tooltip))
    return this
  }

  edge(
    source: Pick<Node, 'type' | 'id'>,
    target: Pick<Node, 'type' | 'id'>,
    label: string,
    kind: TypeEdgeOnTx,
    tooltip?: InfoTooltip,
  ): this {
    const sourceName = `${source.type}:${source.id}`
    const targetName = `${target.type}:${target.id}`
    this._increaseCountEdgeDirection(sourceName, targetName)

    this._edges.push({
      group: 'edges',
      data: {
        id: `${sourceName}->${label}->${targetName}`,
        source: sourceName,
        target: targetName,
        label,
        tooltip,
        kind,
      },
    })
    return this
  }

  build(customLayoutNodes?: CustomLayoutNodes): ElementDefinition[] {
    let edges = addClassWithMoreThanOneBidirectional(this._edges, this._countEdgeDirection)
    edges = addClassWithKind(edges)
    if (!customLayoutNodes) {
      return this._buildLayout(edges)
    }

    const { center, nodes } = customLayoutNodes
    return [center, ...nodes, ...edges]
  }

  _buildLayout(edges: ElementDefinition[]): ElementDefinition[] {
    if (!this._center) {
      throw new Error('Center node is required')
    }

    return [this._center, ...this._nodes, ...edges]
  }

  getById(id: string): ElementDefinition | undefined {
    // split <type>:<id> and find by <id>
    if (this._center) {
      return [this._center, ...this._nodes].find((node) => node.data.id?.split(':')[1] === id)
    }

    return this._nodes.find((node) => node.data.id?.split(':')[1] === id)
  }
}

interface CustomLayoutNodes {
  center: ElementDefinition
  nodes: ElementDefinition[]
}

export function getGridColumn(type: TypeNodeOnTx, traderRowsLength: number, dexRowsLenght: number): number {
  let col
  const batchOf = 5
  // Add a column for each batch of n
  const leftPaddingCol = 1 + Math.round(traderRowsLength / batchOf)
  const rightPaddingCol = leftPaddingCol + 1 + Math.round(dexRowsLenght / batchOf)

  if (type === TypeNodeOnTx.Trader) {
    col = 0 // first Column
  } else if (type === TypeNodeOnTx.CowProtocol) {
    col = leftPaddingCol
  } else {
    col = rightPaddingCol
  }
  return col
}

/**
 * Build a grid layout using the 'data: {row, col}' attribute
 */
export function buildGridLayout(
  countTypes: Map<TypeNodeOnTx, number>,
  center: ElementDefinition | null,
  nodes: ElementDefinition[],
): { center: ElementDefinition; nodes: ElementDefinition[] } {
  if (!center) {
    throw new Error('Center node is required')
  }

  if (countTypes.get(TypeNodeOnTx.Token)) {
    return { center, nodes }
  }

  const maxRows = Math.max(...countTypes.values())
  const middleOfTotalRows = Math.floor(maxRows / 2)
  const traders = countTypes.get(TypeNodeOnTx.Trader) || 0
  const dexes = countTypes.get(TypeNodeOnTx.Dex) || 0
  const _center = {
    ...center,
    data: {
      ...center.data,
      row: middleOfTotalRows,
      col: getGridColumn(center.data.type, traders, dexes),
    },
  }

  let counterRows = { [TypeNodeOnTx.Trader]: 0, [TypeNodeOnTx.Dex]: 0 }
  if (traders > dexes) {
    const difference = (traders - dexes) / 2
    counterRows[TypeNodeOnTx.Dex] = Math.floor(difference)
  } else if (traders < dexes) {
    const difference = (dexes - traders) / 2
    counterRows[TypeNodeOnTx.Trader] = Math.floor(difference)
  }

  const _nodes = nodes.map((node) => {
    const _node = {
      ...node,
      data: {
        ...node.data,
        row: counterRows[node.data.type],
        col: getGridColumn(node.data.type, traders, dexes),
      },
    }

    if (node.data.type === TypeNodeOnTx.Trader) {
      counterRows = { ...counterRows, [TypeNodeOnTx.Trader]: counterRows[TypeNodeOnTx.Trader] + 1 }
    } else if (node.data.type === TypeNodeOnTx.Dex) {
      counterRows = { ...counterRows, [TypeNodeOnTx.Dex]: counterRows[TypeNodeOnTx.Dex] + 1 }
    }

    return _node
  })

  return { center: _center, nodes: _nodes }
}

/**
 * Add css class to edges that have the same direction more than once
 */
function addClassWithMoreThanOneBidirectional(
  edges: ElementDefinition[],
  countEdgeDirection: Map<string, number>,
): ElementDefinition[] {
  const CLASS_NAME = 'many-bidirectional'

  return edges.map((_edge) => {
    const edgeDirectionName = `${_edge.data.source}-${_edge.data.target}`
    const edgeDirectionCount = countEdgeDirection.get(edgeDirectionName) || 0
    if (edgeDirectionCount > 1) {
      _edge.classes = CLASS_NAME
    }
    return _edge
  })
}

/**
 * Add css class to edges according to the kind
 */
function addClassWithKind(edges: ElementDefinition[]): ElementDefinition[] {
  return edges.map((_edge) => {
    const CLASS_NAME = _edge.data.kind
    _edge.classes = _edge.classes ? `${_edge.classes} ${CLASS_NAME}` : CLASS_NAME
    return _edge
  })
}
