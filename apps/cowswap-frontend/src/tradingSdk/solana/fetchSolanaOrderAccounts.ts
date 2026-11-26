import { hexToBytes } from 'viem'

import { CowEnv } from '@cowprotocol/cow-sdk'
import {
  decodeSolanaOrderAccount,
  findOrderPda,
  getSolanaSettlementProgramId,
  SolanaOrderAccount,
} from '@cowprotocol/sdk-trading-solana'

import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'

export interface SolanaOrderAccountEntry {
  id: string
  orderPda: PublicKey
  /** False while the order has no PDA on-chain: either never created, or already closed by a reclaim. */
  exists: boolean
  /** Undefined while the PDA holds data this version of the account layout cannot decode. */
  account: SolanaOrderAccount | undefined
}

/** `getMultipleAccounts` rejects a request for more addresses than this. */
const MAX_ACCOUNTS_PER_REQUEST = 100

/**
 * Reads the on-chain state of each order, as the PDA derived from its id, in as few RPC calls as the
 * per-request address limit allows.
 */
export async function fetchSolanaOrderAccounts(
  connection: Connection,
  orderIds: string[],
  env: CowEnv,
): Promise<SolanaOrderAccountEntry[]> {
  const programId = getSolanaSettlementProgramId(env)
  const orderPdas = orderIds.map((id) => findOrderPda(programId, hexToBytes(id as `0x${string}`), env)[0])
  const batches = await Promise.all(
    chunk(orderPdas, MAX_ACCOUNTS_PER_REQUEST).map((pdas) => connection.getMultipleAccountsInfo(pdas)),
  )
  const accountsInfo = batches.flat()

  return orderIds.map((id, index) => {
    const accountInfo = accountsInfo[index]

    return {
      id,
      orderPda: orderPdas[index],
      exists: !!accountInfo,
      account: decodeAccount(accountInfo),
    }
  })
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

function decodeAccount(accountInfo: AccountInfo<Buffer> | null | undefined): SolanaOrderAccount | undefined {
  if (!accountInfo) return undefined

  try {
    return decodeSolanaOrderAccount(accountInfo.data)
  } catch {
    return undefined
  }
}
