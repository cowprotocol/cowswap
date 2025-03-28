import {useEffect} from 'react';
import { useLocation } from "react-router-dom";
import { useConnectionType, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { Web3StatusInner } from '../../pure/Web3StatusInner'
import { Wrapper } from '../../pure/Web3StatusInner/styled'
import { AccountSelectorModal } from '../AccountSelectorModal'
import { WalletModal } from '../WalletModal'
import http from 'utils/http'

export interface Web3StatusProps {
  pendingActivities: string[]
  className?: string
  onClick?: () => void
}

export function Web3Status({ pendingActivities, className, onClick }: Web3StatusProps) {
  const connectionType = useConnectionType()
  const { account } = useWalletInfo()

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const refCode = queryParams.get("ref"); 

  const { ensName } = useWalletDetails()
  const connectWallet=async()=>{
    try {
      if(account !==undefined){
        const res= await http.post("/connect_wallet",{wallet_address:account,reffer_by:refCode})
        console.log("connect successful")
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=>{
    if(!!account){
      connectWallet()
    }
  },[account])

  const toggleWalletModal = useToggleWalletModal()

  return (
    <Wrapper className={className} onClick={onClick}>
      hello
      <Web3StatusInner
        pendingCount={pendingActivities.length}
        account={account}
        ensName={ensName}
        connectWallet={toggleWalletModal}
        connectionType={connectionType}
      />
      <WalletModal />
      <AccountSelectorModal />
    </Wrapper>
  )
}
