import { NodeSingular } from 'cytoscape'

import { CustomLayoutOptions, CytoscapeLayouts } from './types'

const DEFAULT_VALUES = {
  padding: 10, // padding used on fit
  animate: true,
  fit: true, // whether to fit the viewport to the graph
}
export const LAYOUTS: Record<CytoscapeLayouts, CustomLayoutOptions> = {
  circle: {
    ...DEFAULT_VALUES,
    name: 'circle',
  },
  concentric: {
    ...DEFAULT_VALUES,
    name: 'concentric',
    spacingFactor: 4,
  },
  grid: {
    ...DEFAULT_VALUES,
    name: 'grid',
    position: (node: NodeSingular): { row: number; col: number } => ({ row: node.data('row'), col: node.data('col') }),
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
    nodeDimensionsIncludeLabels: false,
    condense: false,
  },
  klay: {
    ...DEFAULT_VALUES,
    name: 'klay',
    klay: {
      addUnnecessaryBendpoints: true, // Adds bend points even if an edge does not change direction.
      aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
      borderSpacing: 20, // Minimal amount of space to be left to the border
      compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
      edgeRouting: 'SPLINES',
      edgeSpacingFactor: 2,
      spacing: 20,
    },
  },
  fcose: {
    ...DEFAULT_VALUES,
    name: 'fcose',
    quality: 'proof',
    randomize: true,
    animationDuration: 1000,
    animationEasing: undefined,
    nodeDimensionsIncludeLabels: false,
    uniformNodeDimensions: false,
    packComponents: true,
    step: 'all',
    /* spectral layout options */
    // False for random, true for greedy sampling
    samplingType: true,
    // Sample size to construct distance matrix
    sampleSize: 25,
    // Separation amount between nodes
    nodeSeparation: 75,
    // Power iteration tolerance
    piTol: 0.0000001,

    /* incremental layout options */
    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: (): number => 4500,
    // Ideal edge (non nested) length
    idealEdgeLength: (): number => 300,
    // Divisor to compute edge forces
    edgeElasticity: (): number => 0.01,
    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor: 0.9,
    // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
    numIter: 2500,
    // For enabling tiling
    tile: true,
    // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
    tilingPaddingVertical: 10,
    // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
    tilingPaddingHorizontal: 10,
    // Gravity force (constant)
    gravity: 0.8,
    // Gravity range (constant) for compounds
    gravityRangeCompound: 1.5,
    // Gravity force (constant) for compounds
    gravityCompound: 1.0,
    // Gravity range (constant)
    gravityRange: 0.5,
    // Initial cooling factor for incremental layout
    initialEnergyOnIncremental: 0.3,

    /* constraint options */
    // Fix desired nodes to predefined positions
    // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
    fixedNodeConstraint: undefined,
    // Align desired nodes in vertical/horizontal direction
    // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
    alignmentConstraint: undefined,
    // Place two nodes relatively in vertical/horizontal direction
    // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
    relativePlacementConstraint: undefined,
  },
}
