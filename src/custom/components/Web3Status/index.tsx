import styled from 'styled-components/macro'
import WalletModal from 'components/WalletModal'
import { Web3StatusInner, Web3StatusConnect, Web3StatusConnected, Text } from './Web3StatusMod'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { STORAGE_KEY_LAST_PROVIDER } from 'constants/index'
import { useCategorizeRecentActivity } from '@cow/common/hooks/useCategorizeRecentActivity'

export const Wrapper = styled.div`
  color: ${({ theme }) => theme.text1};
  height: 40px;
  width: 100%;
  display: flex;
  padding: 0;
  margin: 0;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: auto;
    height: 100%;
    margin: 0 0 0 auto;
  `};

  button {
    height: auto;
    border-radius: 21px;
    padding: 6px 12px;
    width: max-content;
  }

  ${Web3StatusConnect} {
    background-color: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.white};
    border: 0;
  }

  ${Web3StatusConnected} {
    border-radius: 21px;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.grey1};
    height: 100%;
    width: 100%;
    border: 0;
    box-shadow: none;
    padding: 6px 8px;
    transform: none;

    &:hover {
      border: 0;
    }

    > div > svg > path {
      stroke: ${({ theme }) => theme.text3};
    }
  }

  ${Text} {
  }
`

export default function Web3Status() {
  const walletInfo = useWalletInfo()
  const latestProvider = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)

  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()

  const { active, ensName } = walletInfo
  if (!active && !latestProvider) {
    return null
  }

  return (
    <Wrapper>
      <Web3StatusInner pendingCount={pendingActivity.length} />
      <WalletModal ENSName={ensName} pendingTransactions={pendingActivity} confirmedTransactions={confirmedActivity} />
    </Wrapper>
  )
}
