import { hookDappsRegistry } from './hookDappsRegistry'
import { matchHooksToDappsRegistry } from './utils'

describe('CoW AMM hook dapps', () => {
  it.each(['COW_AMM_WITHDRAW', 'COW_AMM_DEPOSIT'])(
    '%s is out of the hook store but still labels past orders',
    (dappId) => {
      expect(dappId in hookDappsRegistry).toBe(false)

      const [match] = matchHooksToDappsRegistry([{ dappId, target: '0x01', callData: '0x', gasLimit: '100000' }])

      expect(match.dapp?.id).toBe(dappId)
    },
  )
})
