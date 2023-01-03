// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import TokensListWorker from 'worker-loader!./tokensList.worker'

export let tokensListWorker: Worker | null = null

const EVENTS: { [key: string]: string } = {
  TOKENS_LOADED: 'TOKENS_LOADED',
}

export function initWorker() {
  const worker: Worker = new TokensListWorker()

  worker.addEventListener('message', ({ data }) => {
    const event = data?.event
    const eventData = data?.data

    if (!EVENTS[event]) return

    console.log('EVENT WEB WORKER:', { event, eventData })
  })

  tokensListWorker = worker
}
