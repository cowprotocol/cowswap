const CONFIG_PATH = 'https://raw.githubusercontent.com/cowprotocol/cow-fi/configuration/config/'

export interface CowStats {
  totalTrades: number, // https://dune.com/queries/1034337
  surplus: { // https://dune.com/queries/270604
    reasonable: number,
    unusual: number
  },
  lastModified: Date
}

type CowStatsConfig = Omit<CowStats, 'lastModified'> & { lastModified: string }

async function getFromConfig<T>(configFilePath: string): Promise<T> {
  const response = await fetch(CONFIG_PATH + `${configFilePath}`)
  return await response.json()
}

export async function getCowStats(): Promise<CowStats> {
  const statsConfig = await getFromConfig<CowStatsConfig>('stats.json')
  return {
    ...statsConfig,
    lastModified: new Date(statsConfig.lastModified)
  }
}
