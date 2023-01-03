// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import TokensListWorker from 'worker-loader!./tokensList.worker'
import { TokensListsWorkerEvents } from './types'

export let tokensListWorker: Worker | null = null

export function initWorker() {
  const worker: Worker = new TokensListWorker()

  worker.addEventListener('message', ({ data }) => {
    const event = data?.event as TokensListsWorkerEvents
    const eventData = data?.data

    if (!(event in TokensListsWorkerEvents)) return

    console.log('EVENT WEB WORKER:', { event, eventData })
  })

  tokensListWorker = worker
}
