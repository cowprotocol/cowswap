import type { Address, Hex } from 'viem'
import { maxUint256 } from 'viem'
import type { Config } from 'wagmi'
import { getPublicClient, readContract, writeContract } from 'wagmi/actions'

import { calculateGasMargin } from '@cowprotocol/common-utils'
import { type AccountAddress, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { PermitHookData } from '@cowprotocol/permit-utils'

import { estimateApprove, extractApprovalAmountFromLogs } from 'modules/erc20Approve'
import type { GeneratePermitHook } from 'modules/permit'
import { shouldZeroApprove } from 'modules/zeroApproval'

import { TransactionNotBroadcastError } from 'common/hooks/useGetReceipt'

import { ensureEoaTwapSpenderAllowance, getEoaTwapApprovalNeeds } from './ensureEoaTwapSpenderAllowance'
import { waitForEoaTwapTxReceipt } from './waitForEoaTwapTxReceipt.utils'

import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../../../state/eoaTwapSigningStepAtom'
import { buildEoaTwapSigningStepPlan } from '../../../utils/buildEoaTwapSigningStepPlan'

jest.mock('wagmi/actions', () => ({
  getPublicClient: jest.fn(),
  readContract: jest.fn(),
  writeContract: jest.fn(),
}))

jest.mock('modules/erc20Approve', () => ({
  estimateApprove: jest.fn(),
  extractApprovalAmountFromLogs: jest.fn(),
}))

jest.mock('modules/zeroApproval', () => ({
  shouldZeroApprove: jest.fn(),
}))

jest.mock('./waitForEoaTwapTxReceipt.utils', () => ({
  waitForEoaTwapTxReceipt: jest.fn(),
}))

const mockedGetPublicClient = getPublicClient as jest.MockedFunction<typeof getPublicClient>
const mockedReadContract = readContract as jest.MockedFunction<typeof readContract>
const mockedWriteContract = writeContract as jest.MockedFunction<typeof writeContract>
const mockedEstimateApprove = estimateApprove as jest.MockedFunction<typeof estimateApprove>
const mockedExtractApprovalAmountFromLogs = extractApprovalAmountFromLogs as jest.MockedFunction<
  typeof extractApprovalAmountFromLogs
>
const mockedShouldZeroApprove = shouldZeroApprove as jest.MockedFunction<typeof shouldZeroApprove>
const mockedWaitForEoaTwapTxReceipt = waitForEoaTwapTxReceipt as jest.MockedFunction<typeof waitForEoaTwapTxReceipt>

const CONFIG = {} as Config
const ACCOUNT = '0x1111111111111111111111111111111111111111' as AccountAddress
const SPENDER = '0x2222222222222222222222222222222222222222' as AccountAddress
const SELL_TOKEN = '0x3333333333333333333333333333333333333333' as Address
const HASH = '0xabc' as Hex
const AMOUNT_TO_COVER = 1_000n
const AMOUNT_TO_APPROVE = maxUint256
const ESTIMATED_GAS = 100_000n
const PUBLIC_CLIENT = { kind: 'public-client' } as never

const PERMIT_INFO = { type: 'eip-2612' as const, name: 'COW', version: '1' }
const PERMIT_DATA: PermitHookData = {
  target: SELL_TOKEN,
  callData: '0xpermit',
  gasLimit: '50000',
}

function baseParams(
  overrides: Partial<Parameters<typeof ensureEoaTwapSpenderAllowance>[0]> = {},
): Parameters<typeof ensureEoaTwapSpenderAllowance>[0] {
  return {
    config: CONFIG,
    chainId: SupportedChainId.SEPOLIA,
    account: ACCOUNT,
    sellTokenAddress: SELL_TOKEN,
    sellTokenName: 'COW',
    spender: SPENDER,
    amountToCover: AMOUNT_TO_COVER,
    amountToApprove: AMOUNT_TO_APPROVE,
    onSigningStep: jest.fn(),
    approvalNeeds: { needsApproval: true, needsZeroApproval: false },
    ...overrides,
  }
}

function setupSuccessfulOnChainApprove(): void {
  mockedGetPublicClient.mockReturnValue(PUBLIC_CLIENT)
  mockedEstimateApprove.mockResolvedValue({ gasLimit: ESTIMATED_GAS })
  mockedWriteContract.mockResolvedValue(HASH as never)
  mockedWaitForEoaTwapTxReceipt.mockResolvedValue(successReceipt())
  mockedExtractApprovalAmountFromLogs.mockReturnValue(AMOUNT_TO_APPROVE)
}

function successReceipt(): Awaited<ReturnType<typeof waitForEoaTwapTxReceipt>> {
  return {
    status: 'success',
    blockNumber: 1n,
    transactionHash: HASH,
    logs: [],
  } as Awaited<ReturnType<typeof waitForEoaTwapTxReceipt>>
}

describe('getEoaTwapApprovalNeeds()', () => {
  beforeEach(() => {
    mockedReadContract.mockReset()
    mockedShouldZeroApprove.mockReset()
  })

  it('does not need approval when allowance already covers the sell amount', async () => {
    mockedReadContract.mockResolvedValue(AMOUNT_TO_COVER as never)

    await expect(
      getEoaTwapApprovalNeeds({
        config: CONFIG,
        account: ACCOUNT,
        sellTokenAddress: SELL_TOKEN,
        spender: SPENDER,
        amountToCover: AMOUNT_TO_COVER,
        amountToApprove: AMOUNT_TO_APPROVE,
      }),
    ).resolves.toEqual({ needsApproval: false, needsZeroApproval: false })

    expect(mockedShouldZeroApprove).not.toHaveBeenCalled()
  })

  it('treats a failed allowance read as zero and asks shouldZeroApprove', async () => {
    mockedReadContract.mockRejectedValue(new Error('rpc'))
    mockedShouldZeroApprove.mockResolvedValue(true)

    await expect(
      getEoaTwapApprovalNeeds({
        config: CONFIG,
        account: ACCOUNT,
        sellTokenAddress: SELL_TOKEN,
        spender: SPENDER,
        amountToCover: AMOUNT_TO_COVER,
        amountToApprove: AMOUNT_TO_APPROVE,
      }),
    ).resolves.toEqual({ needsApproval: true, needsZeroApproval: true })

    expect(mockedShouldZeroApprove).toHaveBeenCalledWith({
      tokenAddress: SELL_TOKEN,
      owner: ACCOUNT,
      spender: SPENDER,
      amountToApprove: AMOUNT_TO_APPROVE,
      forceApprove: true,
      config: CONFIG,
    })
  })
})

describe('ensureEoaTwapSpenderAllowance()', () => {
  beforeEach(() => {
    mockedGetPublicClient.mockReset()
    mockedReadContract.mockReset()
    mockedWriteContract.mockReset()
    mockedEstimateApprove.mockReset()
    mockedExtractApprovalAmountFromLogs.mockReset()
    mockedWaitForEoaTwapTxReceipt.mockReset()
  })

  it('returns null without signing when allowance is already sufficient', async () => {
    const onSigningStep = jest.fn()
    const generatePermitHook = jest.fn() as GeneratePermitHook

    await expect(
      ensureEoaTwapSpenderAllowance(
        baseParams({
          onSigningStep,
          generatePermitHook,
          permitInfo: PERMIT_INFO,
          approvalNeeds: { needsApproval: false, needsZeroApproval: false },
        }),
      ),
    ).resolves.toBeNull()

    expect(onSigningStep).not.toHaveBeenCalled()
    expect(generatePermitHook).not.toHaveBeenCalled()
    expect(mockedWriteContract).not.toHaveBeenCalled()
  })

  it('prefers a permit for amountToApprove and skips on-chain approve', async () => {
    const onSigningStep = jest.fn()
    const generatePermitHook = jest.fn().mockResolvedValue(PERMIT_DATA) as GeneratePermitHook

    await expect(
      ensureEoaTwapSpenderAllowance(
        baseParams({
          onSigningStep,
          generatePermitHook,
          permitInfo: PERMIT_INFO,
          permitStep: EoaTwapSigningSteps.PermitPoller,
        }),
      ),
    ).resolves.toEqual(PERMIT_DATA)

    expect(generatePermitHook).toHaveBeenCalledWith({
      inputToken: { address: SELL_TOKEN, name: 'COW' },
      account: ACCOUNT,
      permitInfo: PERMIT_INFO,
      amount: AMOUNT_TO_APPROVE,
      customSpender: SPENDER,
    })
    expect(onSigningStep.mock.calls).toEqual([
      [{ step: EoaTwapSigningSteps.PermitPoller, phase: EoaTwapSigningPhase.Sign }],
      [{ step: EoaTwapSigningSteps.PermitPoller, phase: EoaTwapSigningPhase.Confirmed }],
    ])
    expect(mockedWriteContract).not.toHaveBeenCalled()
  })

  it('replaces the stepper plan and falls back to on-chain approve when permit generation fails', async () => {
    setupSuccessfulOnChainApprove()

    const onSigningStep = jest.fn()
    const generatePermitHook = jest.fn().mockRejectedValue(new Error('user rejected')) as GeneratePermitHook
    const onChainFallbackPlan = buildEoaTwapSigningStepPlan({
      poller: { needsApproval: true, needsZeroApproval: false, canUsePermit: false },
    })

    await expect(
      ensureEoaTwapSpenderAllowance(
        baseParams({
          onSigningStep,
          generatePermitHook,
          permitInfo: PERMIT_INFO,
          permitStep: EoaTwapSigningSteps.PermitPoller,
          step: EoaTwapSigningSteps.ApprovePoller,
          onChainFallbackPlan,
        }),
      ),
    ).resolves.toBeNull()

    expect(onSigningStep).toHaveBeenCalledWith({
      step: EoaTwapSigningSteps.ApprovePoller,
      phase: EoaTwapSigningPhase.Sign,
      plan: onChainFallbackPlan,
    })
    expect(mockedWriteContract).toHaveBeenCalledTimes(1)
    expect(mockedWriteContract).toHaveBeenCalledWith(
      CONFIG,
      expect.objectContaining({
        address: SELL_TOKEN,
        functionName: 'approve',
        args: [SPENDER, AMOUNT_TO_APPROVE],
        gas: calculateGasMargin(ESTIMATED_GAS),
        account: ACCOUNT,
      }),
    )
    expect(onSigningStep).toHaveBeenCalledWith({
      step: EoaTwapSigningSteps.ApprovePoller,
      phase: EoaTwapSigningPhase.WaitingForTx,
    })
    expect(onSigningStep).toHaveBeenCalledWith({
      step: EoaTwapSigningSteps.ApprovePoller,
      phase: EoaTwapSigningPhase.Confirmed,
    })
  })

  it('falls back onto the zero-approve step when permit fails and USDT-style reset is required', async () => {
    setupSuccessfulOnChainApprove()

    const onSigningStep = jest.fn()
    const generatePermitHook = jest.fn().mockResolvedValue(undefined) as GeneratePermitHook
    const onChainFallbackPlan = buildEoaTwapSigningStepPlan({
      poller: { needsApproval: true, needsZeroApproval: true, canUsePermit: false },
    })

    await expect(
      ensureEoaTwapSpenderAllowance(
        baseParams({
          onSigningStep,
          generatePermitHook,
          permitInfo: PERMIT_INFO,
          permitStep: EoaTwapSigningSteps.PermitPoller,
          step: EoaTwapSigningSteps.ApprovePoller,
          zeroStep: EoaTwapSigningSteps.ZeroApprovePoller,
          onChainFallbackPlan,
          approvalNeeds: { needsApproval: true, needsZeroApproval: true },
        }),
      ),
    ).resolves.toBeNull()

    expect(onSigningStep).toHaveBeenCalledWith({
      step: EoaTwapSigningSteps.ZeroApprovePoller,
      phase: EoaTwapSigningPhase.Sign,
      plan: onChainFallbackPlan,
    })
    expect(mockedWriteContract).toHaveBeenNthCalledWith(1, CONFIG, expect.objectContaining({ args: [SPENDER, 0n] }))
    expect(mockedWriteContract).toHaveBeenNthCalledWith(
      2,
      CONFIG,
      expect.objectContaining({ args: [SPENDER, AMOUNT_TO_APPROVE] }),
    )
  })

  it('uses on-chain approve when the token does not support permit', async () => {
    setupSuccessfulOnChainApprove()
    const onSigningStep = jest.fn()
    const generatePermitHook = jest.fn() as GeneratePermitHook

    await expect(
      ensureEoaTwapSpenderAllowance(
        baseParams({
          onSigningStep,
          generatePermitHook,
          permitInfo: { type: 'unsupported' },
        }),
      ),
    ).resolves.toBeNull()

    expect(generatePermitHook).not.toHaveBeenCalled()
    expect(mockedWriteContract).toHaveBeenCalledTimes(1)
  })

  it('throws when the mined approval amount is below amountToCover', async () => {
    setupSuccessfulOnChainApprove()
    mockedExtractApprovalAmountFromLogs.mockReturnValue(AMOUNT_TO_COVER - 1n)

    await expect(ensureEoaTwapSpenderAllowance(baseParams())).rejects.toThrow('Approved amount is not sufficient!')
  })

  it('maps a never-broadcast approval hash to a user-facing error', async () => {
    setupSuccessfulOnChainApprove()
    mockedWaitForEoaTwapTxReceipt.mockRejectedValue(new TransactionNotBroadcastError(HASH))

    await expect(ensureEoaTwapSpenderAllowance(baseParams())).rejects.toThrow(
      'Approval was cancelled or not broadcast. Please try again.',
    )
  })

  it('throws when the approval transaction reverts', async () => {
    setupSuccessfulOnChainApprove()
    mockedWaitForEoaTwapTxReceipt.mockResolvedValue({
      ...successReceipt(),
      status: 'reverted',
    })

    await expect(ensureEoaTwapSpenderAllowance(baseParams())).rejects.toThrow('Approval transaction failed')
  })
})
