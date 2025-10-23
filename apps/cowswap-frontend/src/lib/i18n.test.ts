import { jest } from '@jest/globals'
type CatalogMessages = {
  messages?: Record<string, string>
}

jest.mock('@lingui/core', () => {
  const load = jest.fn()
  const activate = jest.fn()
  const loadLocaleData = jest.fn()

  return {
    i18n: {
      load,
      activate,
      loadLocaleData,
      locale: undefined,
    },
  }
})

const { i18n } = jest.requireMock('@lingui/core') as {
  i18n: { load: jest.Mock; activate: jest.Mock; loadLocaleData: jest.Mock }
}
const {
  createDynamicActivate,
} = require('./i18nActivate') as typeof import('./i18nActivate')
type LocaleCatalogModule = import('./i18nActivate').LocaleCatalogModule

describe('dynamicActivate', () => {
  const loadMock = i18n.load as unknown as jest.Mock
  const activateMock = i18n.activate as unknown as jest.Mock
  const loadLocaleDataMock = i18n.loadLocaleData as unknown as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('loads messages from a .po catalog', async () => {
    const messages: CatalogMessages = {
      messages: { hello: 'Hello' },
    }

    const loaders = {
      '../locales/en-US.po': jest
        .fn<Promise<LocaleCatalogModule>, []>()
        .mockResolvedValue({ messages } satisfies LocaleCatalogModule),
    }

    const dynamicActivate = createDynamicActivate(loaders)

    await dynamicActivate('en-US')

    expect(loaders['../locales/en-US.po']).toHaveBeenCalledTimes(1)
    expect(loadLocaleDataMock).toHaveBeenCalledWith(
      'en-US',
      expect.objectContaining({ plurals: expect.any(Function) }),
    )
    const [, loadedMessagesArg] = loadMock.mock.calls.at(-1) ?? []
    expect(loadedMessagesArg?.messages ?? loadedMessagesArg).toEqual(messages.messages)
    expect(activateMock).toHaveBeenCalledWith('en-US')
  })

  it('loads messages from a compiled .js catalog while applying manual plural rules', async () => {
    const messages: CatalogMessages = {
      messages: { moo: 'Moo' },
    }

    const loaders = {
      '../locales/pseudo.js': jest.fn<Promise<LocaleCatalogModule>, []>().mockResolvedValue({
        default: { messages },
      }),
    }

    const dynamicActivate = createDynamicActivate(loaders)

    await dynamicActivate('pseudo')

    expect(loaders['../locales/pseudo.js']).toHaveBeenCalledTimes(1)
    expect(loadLocaleDataMock).toHaveBeenCalledWith(
      'pseudo',
      expect.objectContaining({ plurals: expect.any(Function) }),
    )
    const [, loadedMessagesArg] = loadMock.mock.calls.at(-1) ?? []
    expect(loadedMessagesArg?.messages ?? loadedMessagesArg).toEqual(messages.messages)
    expect(activateMock).toHaveBeenCalledWith('pseudo')
  })

  it('logs an error when no catalog is available', async () => {
    const dynamicActivate = createDynamicActivate({})
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    await dynamicActivate('fr-FR')

    expect(loadMock).not.toHaveBeenCalled()
    expect(activateMock).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not load locale file'),
      expect.any(Error),
    )

    consoleErrorSpy.mockRestore()
  })
})
