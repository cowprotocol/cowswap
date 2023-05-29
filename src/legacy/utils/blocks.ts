import { Log } from '@ethersproject/abstract-provider'
import { JsonRpcProvider } from '@ethersproject/providers'

export const buildBlock2DateMap = async (provider: JsonRpcProvider, logs: Log[]): Promise<Record<string, Date>> => {
  // only check unique blocks
  // hashes are more stable than numbers in case of reorg
  const dedupedLogs = new Set(logs.map((log) => log.blockHash))
  const blockHashes = Array.from(dedupedLogs)
  const blocks = await Promise.all(blockHashes.map((hash) => provider.getBlock(hash)))

  const block2DateMap = blocks.reduce<Record<string, Date>>((accum, block) => {
    // timestamp is unix epoch in seconds
    accum[block.hash] = new Date(block.timestamp * 1000)

    return accum
  }, {})

  return block2DateMap
}
