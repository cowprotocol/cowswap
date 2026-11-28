import { buildAppData } from './buildAppData'

import { AppDataInfo, AppDataOrderClass } from '../types'

function build(orderClass: AppDataOrderClass, enableWaitForCow?: boolean): Promise<AppDataInfo> {
  return buildAppData({
    appCode: 'CoW Swap',
    slippageBips: 50,
    orderClass,
    utm: undefined,
    enableWaitForCow,
  })
}

function enableWaitForCowOf(metadata: AppDataInfo['doc']['metadata']): boolean | undefined {
  if (!('enableWaitForCow' in metadata)) return undefined

  const value = (metadata as { enableWaitForCow?: unknown }).enableWaitForCow
  return typeof value === 'boolean' ? value : undefined
}

describe('buildAppData() enableWaitForCow', () => {
  it('writes false for a market opt-out so a quote merge cannot keep true', async () => {
    const { doc, fullAppData } = await build('market', false)

    expect(enableWaitForCowOf(doc.metadata)).toBe(false)
    expect(fullAppData).toContain('"enableWaitForCow":false')
  })

  it('writes true when Wait & Save is opted in', async () => {
    const { doc, fullAppData } = await build('market', true)

    expect(enableWaitForCowOf(doc.metadata)).toBe(true)
    expect(fullAppData).toContain('"enableWaitForCow":true')
  })

  it.each(['limit', 'twap'] as const)('omits the key for %s orders', async (orderClass) => {
    const { doc, fullAppData } = await build(orderClass)

    expect(enableWaitForCowOf(doc.metadata)).toBeUndefined()
    expect(fullAppData).not.toContain('enableWaitForCow')
  })
})
