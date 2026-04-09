import { MEDIA_WIDTHS } from '@cowprotocol/ui'

import { render, screen } from '@testing-library/react'

import { FullSizeLottie } from './LottieContainer'

jest.mock('lottie-react', () => ({
  __esModule: true,
  default: function MockLottie() {
    return <div data-testid="mock-lottie" />
  },
}))

describe('FullSizeLottie', () => {
  it('zooms opted-in animations slightly on large phones without shrinking the stage', async () => {
    const { container } = render(<FullSizeLottie animationData={{}} largePhoneScale={1.1} />)

    await screen.findByTestId('mock-lottie')

    expect(container.firstChild).toHaveStyleRule('--mobile-animation-scale', '1.1', {
      media: `(min-width: 414px) and (max-width: ${MEDIA_WIDTHS.upToSmall}px)`,
    })
    expect(container.firstChild).toHaveStyleRule('transform', 'scale(var(--mobile-animation-scale))', {
      modifier: '> div',
    })
    expect(container.firstChild).toHaveStyleRule('width', 'var(--size)')
    expect(container.firstChild).not.toHaveStyleRule('margin-inline', 'auto')
  })

  it('keeps small helper animations unscaled by default', async () => {
    const { container } = render(<FullSizeLottie animationData={{}} />)

    await screen.findByTestId('mock-lottie')

    expect(container.firstChild).toHaveStyleRule('--mobile-animation-scale', '1', {
      media: `(min-width: 414px) and (max-width: ${MEDIA_WIDTHS.upToSmall}px)`,
    })
  })
})
