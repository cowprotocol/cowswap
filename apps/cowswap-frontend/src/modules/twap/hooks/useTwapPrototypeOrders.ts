import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { twapOrdersAtom, TwapOrdersList } from 'entities/twap'

import { useTwapOrder } from './useTwapOrder'

import { DEFAULT_PROTOTYPE_TWAP_PART_PROGRESS_MS } from '../const'
import { twapPartOrdersAtom, TwapPartOrders } from '../state/twapPartOrdersAtom'
import { TwapOrderStatus, TwapPrototypeOrderParams, TwapPrototypeScenario } from '../types'
import { buildPrototypeTwapOrderItem } from '../utils/buildPrototypeTwapOrderItem'
import {
  buildPrototypePartOrders,
  getFilteredPrototypeState,
  isCurrentPrototypeOrder,
} from '../utils/prototypeOrderState'
import { buildPrototypeScenarioOrderParams, DEFAULT_TWAP_PROTOTYPE_SEED_SCENARIOS } from '../utils/prototypeScenarios'

interface UseTwapPrototypeOrders {
  canCreatePrototypeOrders: boolean
  hasPrototypeOrders: boolean
  createPrototypeOrder(params?: TwapPrototypeOrderParams): Promise<string | null>
  createPrototypeScenario(scenario: TwapPrototypeScenario): Promise<string | null>
  seedPrototypeOrders(): Promise<void>
  clearPrototypeOrders(): void
}

export function useTwapPrototypeOrders(): UseTwapPrototypeOrders {
  const { account, chainId } = useWalletInfo()
  const twapOrder = useTwapOrder()
  const allTwapOrders = useAtomValue(twapOrdersAtom)
  const allPartOrders = useAtomValue(twapPartOrdersAtom)
  const setTwapOrders = useSetAtom(twapOrdersAtom)
  const setTwapPartOrders = useSetAtom(twapPartOrdersAtom)

  const accountLowerCase = account?.toLowerCase()
  const canCreatePrototypeOrders = Boolean(chainId && accountLowerCase && twapOrder)
  const hasPrototypeOrders = useHasPrototypeOrders(allTwapOrders, accountLowerCase, chainId)
  const clearPrototypeOrders = useClearPrototypeOrders(
    allTwapOrders,
    allPartOrders,
    accountLowerCase,
    chainId,
    setTwapOrders,
    setTwapPartOrders,
  )
  const createPrototypeOrder = useCreatePrototypeOrder(
    allTwapOrders,
    allPartOrders,
    accountLowerCase,
    chainId,
    setTwapOrders,
    setTwapPartOrders,
    twapOrder,
  )
  const createPrototypeScenario = useCreatePrototypeScenario(createPrototypeOrder, twapOrder)
  const seedPrototypeOrders = useSeedPrototypeOrders(
    allTwapOrders,
    allPartOrders,
    accountLowerCase,
    chainId,
    setTwapOrders,
    setTwapPartOrders,
    twapOrder,
  )

  return {
    canCreatePrototypeOrders,
    hasPrototypeOrders,
    createPrototypeOrder,
    createPrototypeScenario,
    seedPrototypeOrders,
    clearPrototypeOrders,
  }
}

function getPrototypeSimulation(
  status: TwapOrderStatus,
  prototypeSimulation: TwapPrototypeOrderParams['prototypeSimulation'],
): TwapPrototypeOrderParams['prototypeSimulation'] {
  if (prototypeSimulation !== undefined) {
    return prototypeSimulation
  }

  if (status !== TwapOrderStatus.Pending) {
    return undefined
  }

  return { partProgressMs: DEFAULT_PROTOTYPE_TWAP_PART_PROGRESS_MS }
}

function useClearPrototypeOrders(
  allTwapOrders: TwapOrdersList,
  allPartOrders: TwapPartOrders,
  accountLowerCase: string | undefined,
  chainId: number | undefined,
  setTwapOrders: (value: TwapOrdersList) => void,
  setTwapPartOrders: (value: TwapPartOrders) => void,
): () => void {
  return useCallback(() => {
    if (!accountLowerCase || !chainId) return

    const { nextOrders, nextPartOrders } = getFilteredPrototypeState(
      allTwapOrders,
      allPartOrders,
      chainId,
      accountLowerCase,
    )

    setTwapOrders(nextOrders)
    setTwapPartOrders(nextPartOrders)
  }, [accountLowerCase, allPartOrders, allTwapOrders, chainId, setTwapOrders, setTwapPartOrders])
}

function useCreatePrototypeOrder(
  allTwapOrders: TwapOrdersList,
  allPartOrders: TwapPartOrders,
  accountLowerCase: string | undefined,
  chainId: number | undefined,
  setTwapOrders: (value: TwapOrdersList) => void,
  setTwapPartOrders: (value: TwapPartOrders) => void,
  twapOrder: ReturnType<typeof useTwapOrder>,
): (params?: TwapPrototypeOrderParams) => Promise<string | null> {
  return useCallback(
    async (params: TwapPrototypeOrderParams = {}): Promise<string | null> => {
      if (!chainId || !accountLowerCase || !twapOrder) return null

      const status = params.status ?? TwapOrderStatus.Pending
      const orderItem = buildPrototypeTwapOrderItem({
        chainId,
        ownerAddress: accountLowerCase,
        twapOrder,
        status,
        submissionDate: params.submissionDate ?? new Date().toISOString(),
        executedDate: params.executedDate,
        saltSeed: params.saltSeed ?? Date.now(),
        confirmedPartsCount: params.confirmedPartsCount,
        prototypeSimulation: getPrototypeSimulation(status, params.prototypeSimulation),
      })

      setTwapOrders({ ...allTwapOrders, [orderItem.id]: orderItem })

      if (params.createPartOrders ?? status !== TwapOrderStatus.WaitSigning) {
        const partOrders = await buildPrototypePartOrders([orderItem], accountLowerCase, chainId)

        setTwapPartOrders({ ...allPartOrders, ...partOrders })
      }

      return orderItem.id
    },
    [accountLowerCase, allPartOrders, allTwapOrders, chainId, setTwapOrders, setTwapPartOrders, twapOrder],
  )
}

function useCreatePrototypeScenario(
  createPrototypeOrder: (params?: TwapPrototypeOrderParams) => Promise<string | null>,
  twapOrder: ReturnType<typeof useTwapOrder>,
): (scenario: TwapPrototypeScenario) => Promise<string | null> {
  return useCallback(
    async (scenario: TwapPrototypeScenario): Promise<string | null> => {
      if (!twapOrder) return null

      return createPrototypeOrder(
        buildPrototypeScenarioOrderParams(scenario, {
          baseNow: Date.now(),
          numOfParts: twapOrder.numOfParts,
          timeInterval: twapOrder.timeInterval,
        }),
      )
    },
    [createPrototypeOrder, twapOrder],
  )
}

function useHasPrototypeOrders(
  allTwapOrders: TwapOrdersList,
  accountLowerCase: string | undefined,
  chainId: number | undefined,
): boolean {
  return useMemo(() => {
    if (!accountLowerCase || !chainId) return false

    return Object.values(allTwapOrders).some((order) => isCurrentPrototypeOrder(order, chainId, accountLowerCase))
  }, [accountLowerCase, allTwapOrders, chainId])
}

function useSeedPrototypeOrders(
  allTwapOrders: TwapOrdersList,
  allPartOrders: TwapPartOrders,
  accountLowerCase: string | undefined,
  chainId: number | undefined,
  setTwapOrders: (value: TwapOrdersList) => void,
  setTwapPartOrders: (value: TwapPartOrders) => void,
  twapOrder: ReturnType<typeof useTwapOrder>,
): () => Promise<void> {
  return useCallback(async () => {
    if (!chainId || !accountLowerCase || !twapOrder) return

    const baseNow = Date.now()
    const { nextOrders, nextPartOrders } = getFilteredPrototypeState(
      allTwapOrders,
      allPartOrders,
      chainId,
      accountLowerCase,
    )

    const orders = DEFAULT_TWAP_PROTOTYPE_SEED_SCENARIOS.map((scenario, index) => {
      const orderParams = buildPrototypeScenarioOrderParams(scenario, {
        baseNow,
        numOfParts: twapOrder.numOfParts,
        timeInterval: twapOrder.timeInterval,
      })

      return buildPrototypeTwapOrderItem({
        chainId,
        ownerAddress: accountLowerCase,
        twapOrder,
        status: orderParams.status ?? TwapOrderStatus.Pending,
        submissionDate: orderParams.submissionDate ?? new Date(baseNow).toISOString(),
        executedDate: orderParams.executedDate,
        saltSeed: baseNow + index,
        confirmedPartsCount: orderParams.confirmedPartsCount,
        prototypeSimulation: getPrototypeSimulation(
          orderParams.status ?? TwapOrderStatus.Pending,
          orderParams.prototypeSimulation,
        ),
      })
    })

    const prototypeOrders = Object.fromEntries(orders.map((order) => [order.id, order]))
    const prototypePartOrders = await buildPrototypePartOrders(orders, accountLowerCase, chainId)

    setTwapOrders({ ...nextOrders, ...prototypeOrders })
    setTwapPartOrders({ ...nextPartOrders, ...prototypePartOrders })
  }, [accountLowerCase, allPartOrders, allTwapOrders, chainId, setTwapOrders, setTwapPartOrders, twapOrder])
}
