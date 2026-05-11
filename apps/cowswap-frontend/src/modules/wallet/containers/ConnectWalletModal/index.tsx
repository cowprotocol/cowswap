import { ReactNode } from 'react'

import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { useConnect, useConnectors } from 'wagmi'

import { useModalIsOpen, useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { CowModal } from 'common/pure/Modal'

export function ConnectWalletModal(): ReactNode {
  const isOpen = useModalIsOpen(ApplicationModal.WALLET)
  const closeModal = useCloseModal(ApplicationModal.WALLET)
  const connectors = useConnectors()
  const { mutateAsync: connect, isPending, error } = useConnect()

  const handleConnect = async (connector: (typeof connectors)[number]): Promise<void> => {
    try {
      await connect({ connector })
      closeModal()
    } catch {
      // Error is shown via useConnect error state
    }
  }

  if (!isOpen) return null

  return (
    <CowModal isOpen={isOpen} onDismiss={closeModal}>
      <div style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>
          <Trans>Connect wallet</Trans>
        </h3>
        <p style={{ marginBottom: 20, color: 'var(--cow-color-text2)' }}>
          <Trans>Choose a wallet to connect to CoW Swap</Trans>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {connectors.map((connector) => (
            <ButtonPrimary
              key={connector.uid}
              buttonSize={ButtonSize.BIG}
              disabled={isPending}
              onClick={() => void handleConnect(connector)}
            >
              {connector.name}
            </ButtonPrimary>
          ))}
        </div>
        {error && <p style={{ marginTop: 16, color: 'var(--cow-color-danger)', fontSize: 14 }}>{error.message}</p>}
      </div>
    </CowModal>
  )
}
