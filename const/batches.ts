export const batches = [
  {
    id: 1,
    label: 'Full CoW',
    orders: 12,
    gasPerOrder: 30,
    description: "For some orders a CoW was found. Users saved both on individual gas costs and LP fees.",
    batchURL: 'https://etherscan.io/tx/0x691d1a8ba39c036e841b6e2ed970f9068ac4a27b61955afb852f11019f2ff4d8',
    visual: 'cow-graph-partialCow.png',
    bars: [
      { id: 1, network: 'UNIV3', percent: 15 },
      { id: 2, network: '0X', percent: 15 },
      { id: 3, network: 'BAL', percent: 15 },
      { id: 4, network: 'COW', percent: 55 },
    ]
  },
  {
    id: 2,
    label: 'Partial CoW',
    orders: 4,
    gasPerOrder: 21,
    description: "Description for Partial Cow should be placed in here.",
    batchURL: '/',
    visual: 'cow-graph-partialCow.png',
    bars: [
      { id: 1, network: 'PSP', percent: 5 },
      { id: 2, network: '0X', percent: 25 },
      { id: 3, network: 'UNIV3', percent: 15 },
      { id: 4, network: 'COW', percent: 55 },
    ]
  },
  {
    id: 3,
    label: 'No CoW',
    orders: 8,
    gasPerOrder: 11,
    description: "Description for No Cow should be placed in here.",
    batchURL: '/',
    visual: 'cow-graph-partialCow.png',
    bars: [
      { id: 1, network: 'UNIV3', percent: 1 },
      { id: 2, network: '0X', percent: 10 },
      { id: 3, network: 'BAL', percent: 21 },
      { id: 4, network: 'COW', percent: 68 },
    ]
  }
]