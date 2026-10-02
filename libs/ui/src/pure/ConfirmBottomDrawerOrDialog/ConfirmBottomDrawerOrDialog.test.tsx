import { ReactNode } from 'react'

import { act, render, screen } from '@testing-library/react'

import { ConfirmBottomDrawerOrDialog } from './ConfirmBottomDrawerOrDialog.pure'

jest.mock('@cowprotocol/common-hooks', () => ({
  useMediaQuery: jest.fn(() => false),
}))

jest.mock('../BottomDrawer/BottomDrawerOrDialog', () => ({
  BottomDrawerOrDialog: ({
    children,
    isOpen,
    onOpenChange,
  }: {
    children: ReactNode
    isOpen: boolean
    onOpenChange?: (open: boolean) => void
  }) => (
    <div data-testid="bottom-drawer-or-dialog" data-open={String(isOpen)}>
      <button type="button" data-testid="request-close" onClick={() => onOpenChange?.(false)}>
        request close
      </button>
      {children}
    </div>
  ),
}))

jest.mock('../ModalHeader', () => ({
  ModalHeader: ({ title }: { title: ReactNode }) => <h2>{title}</h2>,
}))

jest.mock('../Modal/Modal.pure', () => ({
  Modal: {
    Root: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Description: ({ children }: { children: ReactNode }) => <p>{children}</p>,
    Content: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    FooterWithTwoButtons: ({
      secondaryButton,
      primaryButton,
    }: {
      secondaryButton: { label: ReactNode; onClick(): void }
      primaryButton: { label: ReactNode; onClick(): void; disabled?: boolean }
    }) => (
      <div>
        <button type="button" onClick={secondaryButton.onClick}>
          {secondaryButton.label}
        </button>
        <button type="button" disabled={primaryButton.disabled} onClick={primaryButton.onClick}>
          {primaryButton.label}
        </button>
      </div>
    ),
  },
}))

describe('ConfirmBottomDrawerOrDialog', () => {
  it('renders title, description, content, and action buttons', () => {
    render(
      <ConfirmBottomDrawerOrDialog
        isOpen
        title="Confirm action"
        description="Are you sure?"
        content={<div>Custom content</div>}
        cancelLabel="Cancel"
        onCancel={jest.fn()}
        confirmLabel="Confirm"
        onConfirm={jest.fn()}
      />,
    )

    expect(screen.getByText('Confirm action')).toBeTruthy()
    expect(screen.getByText('Are you sure?')).toBeTruthy()
    expect(screen.getByText('Custom content')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeTruthy()
  })

  it('calls onDismiss when the overlay requests close', () => {
    const onDismiss = jest.fn()

    render(
      <ConfirmBottomDrawerOrDialog
        isOpen
        title="Confirm action"
        content={<div>Custom content</div>}
        cancelLabel="Cancel"
        onCancel={jest.fn()}
        confirmLabel="Confirm"
        onConfirm={jest.fn()}
        onDismiss={onDismiss}
      />,
    )

    act(() => {
      screen.getByTestId('request-close').click()
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
