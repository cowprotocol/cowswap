import { render, screen, fireEvent } from '@testing-library/react'
import { useAppData } from 'hooks/useAppData'

import { AppDataRowContent } from './AppDataRowContent'

jest.mock('hooks/useAppData')
jest.mock('../AppData/AppDataContent', () => ({
  AppDataContent: ({ showDecodedAppData }: { showDecodedAppData: boolean }) =>
    showDecodedAppData ? <div>Decoded metadata</div> : null,
}))
jest.mock('components/common/RowWithCopyButton', () => ({
  RowWithCopyButton: ({ textToCopy, contentsToDisplay }: { textToCopy: string; contentsToDisplay: string }) => (
    <span data-testid="copy-hash" data-copy={textToCopy}>
      {contentsToDisplay}
    </span>
  ),
}))

const hash = `0x${'a'.repeat(64)}`
const mockedUseAppData = jest.mocked(useAppData)

beforeEach(() => {
  mockedUseAppData.mockReturnValue({ isLoading: false, hasError: false, appDataDoc: undefined, ipfsUri: undefined })
})

it.each([undefined, '{}'])('renders the same plain hash and copy value with fullAppData=%s', (fullAppData) => {
  render(<AppDataRowContent appData={hash} fullAppData={fullAppData} />)
  expect(screen.getByTestId('copy-hash').getAttribute('data-copy')).toBe(hash)
  expect(screen.queryByRole('link')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '[+] Show more' }))
  expect(screen.getByText('Decoded metadata')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '[-] Show less' }))
  expect(screen.queryByText('Decoded metadata')).toBeNull()
})

it('renders a separate IPFS link without changing the hash copy value', () => {
  const ipfsUri = 'https://ipfs.io/ipfs/example'
  mockedUseAppData.mockReturnValue({ isLoading: false, hasError: false, appDataDoc: undefined, ipfsUri })
  render(<AppDataRowContent appData={hash} />)
  expect(screen.getByRole('link', { name: 'IPFS↗' }).getAttribute('href')).toBe(ipfsUri)
  expect(screen.getByTestId('copy-hash').getAttribute('data-copy')).toBe(hash)
})

it('keeps the hash copyable and hides the IPFS link when metadata has an error', () => {
  mockedUseAppData.mockReturnValue({
    isLoading: false,
    hasError: true,
    appDataDoc: undefined,
    ipfsUri: 'https://ipfs.io/ipfs/example',
  })
  render(<AppDataRowContent appData={hash} />)
  expect(screen.getByTestId('copy-hash').getAttribute('data-copy')).toBe(hash)
  expect(screen.queryByRole('link')).toBeNull()
})
