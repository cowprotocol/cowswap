import React from 'react'
import Modal from '@src/components/Modal'
import styled from 'styled-components'
import WalletModalMod, { WalletModalProps } from './WalletModalMod'
export * from '@src/components/WalletModal'

export const GpModal = styled(Modal)`
  > [data-reach-dialog-content] {
    background-color: ${({ theme }) => theme.bg1};
  }
`

export default function WalletModal(props: Omit<WalletModalProps, 'Modal'>) {
  return <WalletModalMod {...props} Modal={GpModal} />
}
