import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from '@cowprotocol/cow-sdk'

import { TENDERLY_API_BASE_ENDPOINT } from '../const'
import { GetTokenBalanceSlotParams, TenderlyEncodeStatesPayload, TenderlyEncodeStatesResponse } from '../types'

export const calculateTokenBalanceSlot = async (params: GetTokenBalanceSlotParams) => {
  const response = (await fetch(`${TENDERLY_API_BASE_ENDPOINT}/contracts/encode-states`, {
    method: 'POST',
    body: JSON.stringify(getFetchTokenBalanceSlotInput(params)),
    headers: {
      'X-Access-Key': process.env.TENDERLY_API_KEY as string,
    },
  }).then((res) => res.json())) as TenderlyEncodeStatesResponse // TODO: error handling

  const balanceSlots = Object.keys(response.stateOverrides[params.tokenAddress.toLowerCase()].value)

  return balanceSlots[0]
}

function getFetchTokenBalanceSlotInput(params: GetTokenBalanceSlotParams): TenderlyEncodeStatesPayload {
  return {
    networkID: params.chainId.toString(),
    stateOverrides: {
      [params.tokenAddress]: {
        value: {
          [`balances[${COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[params.chainId]}]`]: '0', // this fetch is only used for the slot, so the balance isn't important
        },
      },
    },
  }
}
