import styled from 'styled-components/macro'
import { Web3StatusInner, Web3StatusConnected } from './Web3StatusMod'
import { useWalletInfo, WalletModal } from '@cow/modules/wallet'
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

  ${Web3StatusConnected} {
    height: 100%;
    width: 100%;

    > div > svg > path {
      stroke: ${({ theme }) => theme.text3};
    }
  }
`

export function Web3Status() {
  const walletInfo = useWalletInfo()
  const latestProvider = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)

  const { pendingActivity } = useCategorizeRecentActivity()

  const { active } = walletInfo
  if (!active && !latestProvider) {
    return null
  }

  return (
    <Wrapper>
      <Web3StatusInner pendingCount={pendingActivity.length} />
      <WalletModal />
    </Wrapper>
  )
}
