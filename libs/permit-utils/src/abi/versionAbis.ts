/**
 * ABIs for fetching the version of different permit flavours
 */
export const VERSION_ABIS = [
  [
    {
      constant: true,
      inputs: [],
      name: 'version',
      outputs: [
        {
          name: '',
          type: 'string',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ],
  [
    {
      constant: true,
      inputs: [],
      name: 'ERC712_VERSION',
      outputs: [
        {
          name: '',
          type: 'string',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ],
]
