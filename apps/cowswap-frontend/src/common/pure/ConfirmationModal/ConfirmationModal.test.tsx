import React, { ReactElement, ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { ConfirmationModal } from './ConfirmationModal'

jest.mock('@cowprotocol/ui', () => {
  const actual = jest.requireActual('@cowprotocol/ui')

  return {
    ...actual,
    ConfirmBottomDrawerOrDialog: ({ content, description }: { content: ReactNode; description?: ReactNode }) => (
      <div>
        {description}
        {content}
      </div>
    ),
  }
})

i18n.load('en-US', {})
i18n.activate('en-US')

const INSTRUCTION = /Please click confirm to continue with this swap/i
const TYPE_INSTRUCTION = /Please type the word/i

function renderComponent(props: Partial<React.ComponentProps<typeof ConfirmationModal>> = {}): RenderResult {
  return render(
    wrap(
      <ConfirmationModal
        isOpen
        title="Confirm"
        onDismiss={jest.fn()}
        onEnable={jest.fn()}
        action="continue with this swap"
        confirmWord="confirm"
        {...props}
      />,
    ),
  )
}

function wrap(element: ReactElement): ReactElement {
  return (
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>{element}</StyledComponentsThemeProvider>
    </I18nProvider>
  )
}

describe('ConfirmationModal', () => {
  describe('when skipInput is true', () => {
    it('should render the default instruction when bottomContent is not passed', () => {
      renderComponent({ skipInput: true })

      expect(screen.queryByText(INSTRUCTION)).not.toBeNull()
      expect(screen.queryByRole('textbox')).toBeNull()
    })

    it('should render description and click instruction as sibling paragraphs', () => {
      renderComponent({
        skipInput: true,
        description: 'This swap has a price impact of at least 7%.',
      })

      expect(screen.queryByText('This swap has a price impact of at least 7%.')).not.toBeNull()
      expect(screen.queryByText(INSTRUCTION)).not.toBeNull()
    })

    it('should render nothing above the button when bottomContent is null', () => {
      renderComponent({ skipInput: true, bottomContent: null })

      expect(screen.queryByText(INSTRUCTION)).toBeNull()
      expect(screen.queryByRole('textbox')).toBeNull()
    })

    it('should render bottomContent when it is passed', () => {
      renderComponent({ skipInput: true, bottomContent: <p>Custom bottom content</p> })

      expect(screen.queryByText('Custom bottom content')).not.toBeNull()
      expect(screen.queryByText(INSTRUCTION)).toBeNull()
    })
  })

  describe('when skipInput is false', () => {
    it('should render the type-to-confirm instruction and the input', () => {
      renderComponent()

      expect(screen.queryByText(TYPE_INSTRUCTION)).not.toBeNull()
      expect(screen.queryByRole('textbox')).not.toBeNull()
      expect(screen.queryByText(INSTRUCTION)).toBeNull()
    })

    it('should render description and type instruction as sibling paragraphs', () => {
      renderComponent({
        description: 'This swap has a price impact of at least 7%.',
      })

      expect(screen.queryByText('This swap has a price impact of at least 7%.')).not.toBeNull()
      expect(screen.queryByText(TYPE_INSTRUCTION)).not.toBeNull()
      expect(screen.queryByRole('textbox')).not.toBeNull()
    })

    it('should ignore bottomContent', () => {
      renderComponent({ bottomContent: <p>Custom bottom content</p> })

      expect(screen.queryByText('Custom bottom content')).toBeNull()
      expect(screen.queryByText(TYPE_INSTRUCTION)).not.toBeNull()
    })
  })
})
