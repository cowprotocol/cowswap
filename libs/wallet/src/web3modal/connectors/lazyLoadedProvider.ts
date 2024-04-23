import type { Provider, RequestArguments } from '@web3modal/scaffold-utils/ethers'

export function lazyLoadedProvider(loadProvider: () => Promise<Provider>): Provider {
  const temporaryEventListeners: { event: string; listener: (data: never) => void }[] = []

  let loadedProvider: Provider | null = null

  return {
    request(args: RequestArguments) {
      if (loadedProvider) return loadedProvider.request(args)

      return loadProvider().then((provider) => {
        loadedProvider = provider

        temporaryEventListeners.forEach(({ event, listener }) => {
          provider.on(event, listener)
        })

        return provider.request(args)
      })
    },
    on(event: string, listener: (data: never) => void) {
      if (loadedProvider) return loadedProvider.on(event, listener)

      temporaryEventListeners.push({ event, listener })
    },
    removeListener(event: string, listener: (data: never) => void) {
      if (loadedProvider) return loadedProvider.removeListener(event, listener)

      temporaryEventListeners.splice(
        temporaryEventListeners.findIndex((el) => el.event === event && el.listener === listener),
        1
      )
    },
    emit(event: string) {
      if (loadedProvider) {
        loadedProvider.emit(event)
      }
    },
  }
}
