import { ManageLists as ManageListsMod, ListContainer, PopoverContainer } from './ManageListsMod'
import { DEFAULT_NETWORK_FOR_LISTS, UNSUPPORTED_LIST_URLS } from 'legacy/constants/lists'
import { CurrencyModalView } from 'legacy/components/SearchModal/CurrencySearchModal'
import { TokenList } from '@uniswap/token-lists'
import { acceptListUpdate, removeList, disableList, enableList } from 'legacy/state/lists/actions'
import { supportedChainId } from 'legacy/utils/supportedChainId'
import Row, { RowFixed, RowBetween } from 'legacy/components/Row'
import CardUni from 'legacy/components/Card'
import styled from 'styled-components/macro'
import { TextDot } from 'legacy/components/SearchModal/styleds'
import { transparentize } from 'polished'
import { ButtonPrimary } from 'legacy/components/Button'
import { useWalletInfo } from 'modules/wallet'

export interface ListRowProps {
  acceptListUpdate: (url: string) => ReturnType<typeof acceptListUpdate>
  removeList: (url: string) => ReturnType<typeof removeList>
  disableList: (url: string) => ReturnType<typeof disableList>
  enableList: (url: string) => ReturnType<typeof enableList>
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;

  ${ListContainer} {
    border-top: 1px solid ${({ theme }) => theme.grey1};
    padding: 1rem;
    padding-bottom: 80px;

    svg > path,
    svg > circle {
      stroke: ${({ theme }) => theme.text1};
    }
  }

  ${PopoverContainer} {
    background: ${({ theme }) => theme.bg1};
  }
`

export const RowWrapper = styled(Row)<{ bgColor: string; active: boolean; hasActiveTokens: boolean }>`
  background-color: ${({ bgColor, active, theme }) =>
    active ? `${transparentize(0.75, bgColor)}` ?? 'transparent' : theme.bg1};
  opacity: ${({ hasActiveTokens }) => (hasActiveTokens ? 1 : 0.4)};
  transition: 0.2s;
  align-items: center;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.grey1};

  ${Row}, ${RowFixed}, ${RowBetween} {
    > div {
      color: ${({ active, theme }) => (active ? theme.text1 : theme.text2)};
    }
  }
`

export const Card = styled(CardUni)`
  background: ${({ theme }) => theme.bg1};

  ${Row},
  ${Row} > div > div,
  ${Row} > div > div > div {
    color: ${({ theme }) => theme.text1};
  }

  ${Row} > img {
    background: ${({ theme }) => theme.bg2};
    border-radius: 40px;
    padding: 3px;
    object-fit: contain;
  }

  ${TextDot} {
    background: ${({ theme }) => theme.text1};
  }

  ${ButtonPrimary} {
    min-height: auto;
    padding: 8px 12px;
  }
`

export const ManageLists = (props: {
  setModalView: (view: CurrencyModalView) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}) => {
  const { chainId: connectedChainId } = useWalletInfo()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS

  const listRowProps = {
    acceptListUpdate: (url: string) => acceptListUpdate({ url, chainId }),
    removeList: (url: string) => removeList({ url, chainId }),
    disableList: (url: string) => disableList({ url, chainId }),
    enableList: (url: string) => enableList({ url, chainId }),
  }
  return (
    <Wrapper>
      <ManageListsMod {...props} unsupportedListUrls={UNSUPPORTED_LIST_URLS[chainId]} listRowProps={listRowProps} />
    </Wrapper>
  )
}
