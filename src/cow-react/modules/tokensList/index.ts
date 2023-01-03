// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import TokensListWorker from 'worker-loader!./tokensList.worker'
import { TokensListsWorkerEvents } from './types'
import { initTokensListsDB } from './tokensList.db'

export let tokensListWorker: Worker | null = null

export function initWorker() {
  initTokensListsDB()

  tokensListWorker = new TokensListWorker()
}

export function onWorkerEvent<T>(targetEvent: TokensListsWorkerEvents, callback: (data: T) => void) {
  if (!tokensListWorker) return

  tokensListWorker.addEventListener('message', ({ data }) => {
    const event = data?.event as TokensListsWorkerEvents
    const eventData = data?.data as T

    if (event !== targetEvent) return

    callback(eventData)
  })
}
