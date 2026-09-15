import { render, screen } from '@testing-library/react'
import { orderBookSDK } from 'cowSdk'
import { SWRConfig } from 'swr'

import { TwapAppData } from './TwapAppData.container'

jest.mock('cowSdk', () => ({ orderBookSDK: { getAppData: jest.fn() } }))
jest.mock('components/orders/DetailsTable/items/AppDataItem', () => ({
  AppDataItem: ({ appData, fullAppData }: { appData: string; fullAppData: string }) => (
    <tr>
      <td data-testid="resolved-app-data" data-hash={appData}>
        {fullAppData}
      </td>
    </tr>
  ),
}))
jest.mock('components/common/RowWithCopyButton', () => ({
  RowWithCopyButton: ({ textToCopy }: { textToCopy: string }) => <span>{textToCopy}</span>,
}))

const HASH = `0x${'a'.repeat(64)}`

function renderAppData(): void {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <table>
        <tbody>
          <TwapAppData appData={HASH} chainId={100} />
        </tbody>
      </table>
    </SWRConfig>,
  )
}

describe('TwapAppData', () => {
  beforeEach(() => jest.clearAllMocks())

  it('waits for full app data before mounting the shared renderer', async () => {
    let resolveRequest: (value: { fullAppData: string }) => void = () => undefined
    jest.mocked(orderBookSDK.getAppData).mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    renderAppData()
    expect(screen.getByText('Loading app data…')).toBeTruthy()
    expect(screen.getByText(HASH)).toBeTruthy()
    expect(screen.queryByTestId('resolved-app-data')).toBeNull()

    resolveRequest({ fullAppData: '{"version":"1.0.0"}' })
    const content = await screen.findByTestId('resolved-app-data')
    expect(content.getAttribute('data-hash')).toBe(HASH)
    expect(content.textContent).toBe('{"version":"1.0.0"}')
    expect(orderBookSDK.getAppData).toHaveBeenCalledWith(HASH, { chainId: 100 })
  })

  it.each(['failure', 'empty'])('keeps the hash without invoking legacy decoding on %s', async (result) => {
    if (result === 'failure') jest.mocked(orderBookSDK.getAppData).mockRejectedValue(new Error('Not found'))
    else jest.mocked(orderBookSDK.getAppData).mockResolvedValue({ fullAppData: '' })
    renderAppData()
    expect(await screen.findByText('App data is unavailable.')).toBeTruthy()
    expect(screen.getByText(HASH)).toBeTruthy()
    expect(screen.queryByTestId('resolved-app-data')).toBeNull()
  })
})
