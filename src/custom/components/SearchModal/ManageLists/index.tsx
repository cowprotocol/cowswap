import { ManageLists as ManageListsMod, ListContainer } from './ManageListsMod'
import { DEFAULT_NETWORK_FOR_LISTS, UNSUPPORTED_LIST_URLS } from 'constants/lists'
import { useActiveWeb3React } from 'hooks/web3'
import { CurrencyModalView } from '@src/components/SearchModal/CurrencySearchModal'
import { TokenList } from '@uniswap/token-lists'
import { acceptListUpdate, removeList, disableList, enableList } from 'state/lists/actions'
import { supportedChainId } from 'utils/supportedChainId'
import Row, { RowFixed, RowBetween } from 'components/Row'
import CardUni from 'components/Card'
import styled from 'styled-components/macro'
import { TextDot } from '@src/components/SearchModal/styleds'

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
    ${({ theme }) => theme.neumorphism.boxShadow}
  }
`

export const RowWrapper = styled(Row)<{ bgColor: string; active: boolean; hasActiveTokens: boolean }>`
  background-color: ${({ bgColor, active, theme }) => (active ? bgColor ?? 'transparent' : theme.bg4)};
  opacity: ${({ hasActiveTokens }) => (hasActiveTokens ? 1 : 0.4)};
  transition: 0.2s;
  align-items: center;
  padding: 1rem;
  border-radius: 20px;

  ${Row}, ${RowFixed}, ${RowBetween} {
    > div {
      color: ${({ active, theme }) => (active ? theme.text2 : theme.text1)};
    }
  }
`

export const Card = styled(CardUni)`
  background: ${({ theme }) => theme.bg4};

  ${Row},
  ${Row} > div > div,
  ${Row} > div > div > div {
    color: ${({ theme }) => theme.text1};
  }

  svg > * {
    stroke: ${({ theme }) => theme.text1};
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
`

export const ManageLists = (props: {
  setModalView: (view: CurrencyModalView) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}) => {
  const { chainId: connectedChainId } = useActiveWeb3React()
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
