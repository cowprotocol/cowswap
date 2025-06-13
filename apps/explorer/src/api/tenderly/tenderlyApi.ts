import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { APP_NAME, NATIVE_TOKEN_ADDRESS_LOWERCASE, TENDERLY_API_URL } from 'const'
import { abbreviateString } from 'utils'

import { fetchQuery } from 'api/baseApi'

import {
  Account,
  Contract,
  IndexTradeInput,
  IndexTransferInput,
  PublicTrade as Trade,
  Trace,
  Transfer,
  TxTradesAndTransfers,
  TypeOfTrace,
} from './types'

import { SPECIAL_ADDRESSES } from '../../explorer/const'

export const ALIAS_TRADER_NAME = 'Trader'
const COW_PROTOCOL_CONTRACT_NAME = 'GPv2Settlement'

const API_BASE_URLs: Record<SupportedChainId, string | undefined> = mapSupportedNetworks(
  (_networkId: SupportedChainId): string => `${TENDERLY_API_URL}/${_networkId}`,
)

function _getApiBaseUrl(networkId: SupportedChainId): string {
  const baseUrl = API_BASE_URLs[networkId]

  if (!baseUrl) {
    throw new Error('Unsupported Network. The tenderly API is not available or configured for chain id ' + networkId)
  } else {
    return baseUrl
  }
}

function _get(networkId: SupportedChainId, url: string): Promise<Response> {
  const baseUrl = _getApiBaseUrl(networkId)
  return fetch(baseUrl + url)
}

function _fetchTrace(networkId: SupportedChainId, txHash: string): Promise<Trace> {
  const queryString = `/trace/${txHash}`
  console.log(`[tenderlyApi:fetchTrace] Fetching trace tx ${txHash} on network ${networkId}`)

  return fetchQuery<Trace>({ get: () => _get(networkId, queryString) }, queryString)
}

function _fetchTradesAccounts(networkId: SupportedChainId, txHash: string): Promise<Contract[]> {
  const queryString = `/tx/${txHash}/contracts`
  console.log(`[tenderlyApi:fetchTradesAccounts] Fetching tx trades account on network ${networkId}`)

  return fetchQuery<Array<Contract>>({ get: () => _get(networkId, queryString) }, queryString)
}

export async function getTransactionTrace(networkId: SupportedChainId, txHash: string): Promise<Trace> {
  return _fetchTrace(networkId, txHash)
}

export async function getTransactionContracts(networkId: SupportedChainId, txHash: string): Promise<Contract[]> {
  return _fetchTradesAccounts(networkId, txHash)
}

export async function getTradesAndTransfers(
  networkId: SupportedChainId,
  txHash: string,
): Promise<TxTradesAndTransfers> {
  const trace = await _fetchTrace(networkId, txHash)

  return traceToTransfersAndTrades(trace)
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function traceToTransfersAndTrades(trace: Trace): TxTradesAndTransfers {
  const transfers: Array<Transfer> = []
  const trades: Array<Trade> = []

  try {
    trace.logs.forEach((log) => {
      if (log.name === TypeOfTrace.TRANSFER) {
        const from = log.inputs[IndexTransferInput.from].value
        const to = log.inputs[IndexTransferInput.to].value
        transfers.push({
          token: log.raw.address,
          from,
          to,
          value: log.inputs[IndexTransferInput.value].value,
          isInternal: from === to,
        })
      } else if (log.name === TypeOfTrace.TRADE) {
        const trade = {
          owner: log.inputs[IndexTradeInput.owner].value,
          sellToken: log.inputs[IndexTradeInput.sellToken].value,
          buyToken: log.inputs[IndexTradeInput.buyToken].value,
          sellAmount: log.inputs[IndexTradeInput.sellAmount].value,
          buyAmount: log.inputs[IndexTradeInput.buyAmount].value,
          feeAmount: log.inputs[IndexTradeInput.feeAmount].value,
          orderUid: log.inputs[IndexTradeInput.orderUid].value,
        }
        if (trade.buyToken === NATIVE_TOKEN_ADDRESS_LOWERCASE) {
          //ETH transfers are not captured by ERC20 events, so we need to manually add them to the Transfer list
          transfers.push({
            token: NATIVE_TOKEN_ADDRESS_LOWERCASE,
            from: log.raw.address,
            to: trade.owner,
            value: trade.buyAmount,
            isInternal: log.raw.address === trade.owner,
          })
        } else if (trade.sellToken === NATIVE_TOKEN_ADDRESS_LOWERCASE) {
          //ETH transfers are not captured by ERC20 events, so we need to manually add them to the Transfer list
          transfers.push({
            token: NATIVE_TOKEN_ADDRESS_LOWERCASE,
            from: trade.owner,
            to: log.raw.address,
            value: trade.sellAmount,
            isInternal: log.raw.address === trade.owner,
          })
        }
        trades.push(trade)
      }
    })
  } catch (error) {
    console.error(`Unable to analyze the JSON trace trades`, error)
    throw new Error(`Failed to parse the JSON of tenderly trace API`)
  }

  return { transfers, trades }
}

export async function getTradesAccount(
  networkId: SupportedChainId,
  txHash: string,
  trades: Array<Trade>,
  transfers: Array<Transfer>,
): Promise<Map<string, Account>> {
  const contracts = await _fetchTradesAccounts(networkId, txHash)

  return accountAddressesInvolved(contracts, trades, transfers)
}

/**
 * Allows to obtain a description of addresses involved
 * in a tx
 */
export function accountAddressesInvolved(
  contracts: Contract[],
  trades: Array<Trade>,
  transfers: Array<Transfer>,
): Map<string, Account> {
  const result = new Map()

  // Create a set with transfer (to & from) addresses for quicker access
  const transferAddresses = new Set()

  transfers.forEach((transfer) => {
    transferAddresses.add(transfer.from)
    transferAddresses.add(transfer.to)
  })

  try {
    contracts.forEach((contract: Contract) => {
      // Only use contracts which are involved in a transfer
      if (transferAddresses.has(contract.address))
        result.set(contract.address, {
          alias: _contractName(contract.contract_name),
          address: contract.address,
        })
    })
    trades.forEach((trade) => {
      // Don't overwrite existing contract alias
      // This addresses an edge case where the settlement contract is also a trader
      // See https://github.com/cowprotocol/explorer/issues/491
      if (!result.has(trade.owner)) {
        result.set(trade.owner, {
          alias: getAliasFromAddress(trade.owner),
          address: trade.owner,
        })
      }
    })
    // Track any missing from/to contract as unknown
    transfers
      .flatMap((transfer) => {
        return [transfer.from, transfer.to]
      })
      .forEach((address) => {
        if (!result.get(address)) {
          result.set(address, {
            alias: getAliasFromAddress(address, true),
            address,
          })
        }
      })
  } catch (error) {
    console.error(`Unable to set contracts details transfers and trades`, error)
    throw new Error(`Failed to parse accounts addresses of tenderly API`)
  }

  return result
}

function _contractName(name: string): string {
  if (name === COW_PROTOCOL_CONTRACT_NAME) return APP_NAME

  return name
}

export function getAliasFromAddress(address: string, isUnknown = false): string {
  const lowerCaseAddress = address.toLowerCase()

  if (SPECIAL_ADDRESSES[lowerCaseAddress]) return SPECIAL_ADDRESSES[lowerCaseAddress]

  return isUnknown ? abbreviateString(address, 6, 4) : ALIAS_TRADER_NAME
}
