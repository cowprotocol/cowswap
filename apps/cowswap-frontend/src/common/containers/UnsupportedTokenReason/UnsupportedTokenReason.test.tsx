import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { render } from '@testing-library/react'

import { useSolanaTransferFeeBps } from 'common/hooks/useSolanaTransferFeeBps'

import { LinguiWrapper } from '../../../../LinguiJestProvider'

import { UnsupportedTokenReason } from './index'

jest.mock('common/hooks/useSolanaTransferFeeBps', () => ({
  useSolanaTransferFeeBps: jest.fn(),
}))

const useSolanaTransferFeeBpsMock = useSolanaTransferFeeBps as jest.MockedFunction<typeof useSolanaTransferFeeBps>

const YAM = new Token(SupportedChainId.MAINNET, '0x0aacfbec6a24756c20d41914f2caba817c0d8521', 18, 'YAM')

function renderReason(reason: string | undefined): string | null {
  const { container } = render(
    <LinguiWrapper>
      <UnsupportedTokenReason chainId={SupportedChainId.MAINNET} token={YAM} reason={reason} />
    </LinguiWrapper>,
  )

  return container.textContent
}

describe('UnsupportedTokenReason', () => {
  beforeEach(() => {
    useSolanaTransferFeeBpsMock.mockReturnValue(undefined)
  })

  it('explains a deny listed token', () => {
    expect(renderReason('token is deny listed')).toBe('YAM is unsupported: the token is on the denylist.')
  })

  it('shows any other backend reason as is', () => {
    expect(renderReason('Token-2022 transfer fee')).toBe('YAM is unsupported: Token-2022 transfer fee')
  })

  it('prefers the detected transfer fee over the backend reason', () => {
    useSolanaTransferFeeBpsMock.mockReturnValue(300)

    expect(renderReason('Token-2022 transfer fee')).toBe(
      'YAM charges a 3% fee on every transfer, which CoW Protocol does not support.',
    )
  })

  it('renders nothing without a reason', () => {
    expect(renderReason(undefined)).toBe('')
  })
})
