import { decodeFunctionData } from 'viem'

import { LATEST_APP_DATA_VERSION } from '@cowprotocol/cow-sdk'
import { ComposableCowPollerAbi } from '@cowprotocol/cowswap-abis'

import type { AppDataInfo, CowHook } from 'modules/appData'

import { toKeccak256 } from 'common/utils/toKeccak256'

import { POLL_FUNDS_HOOK_GAS_LIMIT } from './composable-cow-poller.constants'
import { encodePollFundsCalldata } from './composable-cow-poller.utils'
import { EOA_TWAP_POLL_FUNDS_DAPP_ID, injectPollFundsPreHookIntoAppData } from './injectPollFundsPreHookIntoAppData'

const POLLER_ADDRESS = '0xf1C5e22fB6F4B974ad12cA4bc461F9746F77BB7D' as const
const SCHEDULE_ID = '0x4a6d31b249226ff992ea760b06288a012f917aa317e6be37829d163e51af97ad' as const

const EXISTING_PRE_HOOK: CowHook = {
  target: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  callData: '0xdeadbeef',
  gasLimit: '100000',
  dappId: 'existing-pre',
}

const EXISTING_POST_HOOK: CowHook = {
  target: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  callData: '0xcafebabe',
  gasLimit: '50000',
  dappId: 'existing-post',
}

function buildAppData(hooks?: AppDataInfo['doc']['metadata']['hooks']): AppDataInfo {
  const doc: AppDataInfo['doc'] = {
    version: LATEST_APP_DATA_VERSION,
    appCode: 'CoW Swap',
    metadata: hooks ? { hooks } : {},
  }
  const fullAppData = JSON.stringify(doc)

  return {
    doc,
    fullAppData,
    appDataKeccak256: toKeccak256(fullAppData),
  }
}

function expectedPollFundsHook(): CowHook {
  return {
    target: POLLER_ADDRESS,
    callData: encodePollFundsCalldata(SCHEDULE_ID),
    gasLimit: POLL_FUNDS_HOOK_GAS_LIMIT,
    dappId: EOA_TWAP_POLL_FUNDS_DAPP_ID,
  }
}

describe('injectPollFundsPreHookIntoAppData()', () => {
  it('prepends pollFunds before existing pre-hooks so JIT funding runs first', async () => {
    const appData = buildAppData({ pre: [EXISTING_PRE_HOOK] })

    const result = await injectPollFundsPreHookIntoAppData(appData, {
      pollerAddress: POLLER_ADDRESS,
      scheduleId: SCHEDULE_ID,
    })

    expect(result.doc.metadata.hooks?.pre).toEqual([expectedPollFundsHook(), EXISTING_PRE_HOOK])
  })

  it('keeps existing post-hooks unchanged', async () => {
    const appData = buildAppData({
      pre: [EXISTING_PRE_HOOK],
      post: [EXISTING_POST_HOOK],
    })

    const result = await injectPollFundsPreHookIntoAppData(appData, {
      pollerAddress: POLLER_ADDRESS,
      scheduleId: SCHEDULE_ID,
    })

    expect(result.doc.metadata.hooks?.post).toEqual([EXISTING_POST_HOOK])
  })

  it('injects pollFunds as the only pre-hook when appData has no hooks yet', async () => {
    const appData = buildAppData()

    const result = await injectPollFundsPreHookIntoAppData(appData, {
      pollerAddress: POLLER_ADDRESS,
      scheduleId: SCHEDULE_ID,
    })

    expect(result.doc.metadata.hooks?.pre).toEqual([expectedPollFundsHook()])
    expect(result.doc.metadata.hooks?.post).toBeUndefined()
  })

  it('encodes pollFunds(scheduleId) against the poller with the TWAP dapp id', async () => {
    const result = await injectPollFundsPreHookIntoAppData(buildAppData(), {
      pollerAddress: POLLER_ADDRESS,
      scheduleId: SCHEDULE_ID,
    })

    const pollFundsHook = result.doc.metadata.hooks?.pre?.[0]

    expect(pollFundsHook).toEqual(expectedPollFundsHook())

    const decoded = decodeFunctionData({
      abi: ComposableCowPollerAbi,
      data: expectedPollFundsHook().callData,
    })

    expect(decoded.functionName).toBe('pollFunds')
    expect(decoded.args).toEqual([SCHEDULE_ID])
  })

  it('re-hashes appData so staticInput picks up the injected pre-hook', async () => {
    const appData = buildAppData({ pre: [EXISTING_PRE_HOOK] })

    const result = await injectPollFundsPreHookIntoAppData(appData, {
      pollerAddress: POLLER_ADDRESS,
      scheduleId: SCHEDULE_ID,
    })

    expect(result.appDataKeccak256).not.toBe(appData.appDataKeccak256)
    expect(result.appDataKeccak256).toBe(toKeccak256(result.fullAppData))
    expect(result.fullAppData).toContain(EOA_TWAP_POLL_FUNDS_DAPP_ID)
    expect(result.fullAppData).toContain(SCHEDULE_ID.slice(2))
  })
})
