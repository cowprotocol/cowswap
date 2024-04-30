import {strict as assert} from 'node:assert'

const DUNE_API_KEY = process.env.DUNE_API_KEY
assert(DUNE_API_KEY, "DUNE_API_KEY environment var is required")

// TODO: getFromDune will be moved in a future PR to the SDK
interface MetadataQuery {
  executed_at: string,
  // job_id: string,
  // query_duration_millis: number,
  // query_version: number,
  // result_bytes: number
  // result_rows: number
}

interface GetFromDuneResult<T> {
  metadata: MetadataQuery
  // column_names: string[]
  rows: T[]
}

export async function getFromDune<T>(queryId: number): Promise<GetFromDuneResult<T>> {
  const response = await fetch(`https://api.dune.com/api/v0/query/${queryId}/results`, {
    headers: {
      accept: "application/json",
      "X-DUNE-API-KEY": DUNE_API_KEY
    }
  })

  return await response.json()
}

// ------ End of TODO

const TOTAL_TRADES_COUNT_QUERY_ID = 1034337
const TOTAL_SURPLUS_COUNT_QUERY_ID = 270604


interface TotalCount {
  totalCount: number
  lastModified: Date
}

export async function _getTotalCount(queryId: number): Promise<TotalCount> {
  const queryResut = await getFromDune<{ count: number }>(queryId)
  console.log('queryResut', queryId, queryResut)

  // Expect one row
  assert(
    queryResut.rows.length === 1, 
    `Total Count Dune query (${queryId}) must return just one row. Returned ${queryResut.rows.length}`
  )

  return {
    totalCount: queryResut.rows[0].count,
    lastModified: new Date(queryResut.metadata.executed_at)
  }
}

/**
 * @deprecated
 */
export const getTotalTrades = () => _getTotalCount(TOTAL_TRADES_COUNT_QUERY_ID)

/**
 * @deprecated
 */
export const getTotalSurplus = async (): Promise<TotalCount> => {
  const queryResut = await getFromDune<{ surplus_type: string, total_surplus_usd: number }>(TOTAL_SURPLUS_COUNT_QUERY_ID)

  const totalCount = queryResut.rows.reduce((totalSurplus, surplus) => {
    return totalSurplus + surplus.total_surplus_usd
  }, 0)

  return {
    totalCount,
    lastModified: new Date(queryResut.metadata.executed_at)
  }
}
