export let tokensListWorker: Worker | null = null

const EVENTS: { [key: string]: string } = {
  TOKENS_LOADED: 'TOKENS_LOADED',
}

export function initWorker() {
  const worker = new Worker('workers/tokensList/worker.js', { type: 'module' })

  worker.addEventListener('message', ({ data }) => {
    const event = data?.event
    const eventData = data?.data

    if (!EVENTS[event]) return

    console.log('EVENT WEB WORKER:', { event, eventData })
  })

  tokensListWorker = worker
}
