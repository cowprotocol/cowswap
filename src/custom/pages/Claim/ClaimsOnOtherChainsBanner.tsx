import { useMemo, Fragment } from 'react'
import styled from 'styled-components/macro'
import { NETWORK_LABELS, SupportedChainId } from 'constants/chains'
import { useClaimState } from 'state/claim/hooks'
import useChangeNetworks from 'hooks/useChangeNetworks'
import { useActiveWeb3React } from 'hooks/web3'
import NotificationBanner from '@src/custom/components/NotificationBanner'
import { AlertTriangle } from 'react-feather'
import { ClaimInfo } from 'state/claim/reducer'

const ChainSpan = styled.span``
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  flex-flow: row wrap;

  > svg {
    margin-right: 5px;
  }

  > div {
    flex: 1 1 auto;

    &:last-child {
      > span {
        margin-left: 4px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        text-decoration: underline;

        &:last-child {
          &:after {
            content: '!';
          }
        }

        &:not(:last-child) {
          &:after {
            content: ',';
          }
        }
      }
    }
  }
`

/**
 * Returns true when you shouldn't display the banner for the checkedChain
 */
function _shouldNotDisplayBannerForChain(
  checkedChain: SupportedChainId,
  chainId: number | undefined,
  claimInfo: ClaimInfo
) {
  const { available, total } = claimInfo
  return (
    // If this is the same network
    // Important, the double equal comparison is intentional!
    // Don't be dumb like me and change to triple equal and spend awhile figuring out why it doesn't work...
    checkedChain == chainId ||
    // If total claims is 0
    total === 0 ||
    // If there are no available
    available === 0
  )
}

function ClaimsOnOtherChainsBanner({ className }: { className?: string }) {
  const { account, library, chainId } = useActiveWeb3React()
  const { callback } = useChangeNetworks({ account, library, chainId })

  const { claimInfoPerAccount, activeClaimAccount } = useClaimState()

  const chainsWithClaims: SupportedChainId[] = useMemo(() => {
    const claimInfoPerChain = claimInfoPerAccount[activeClaimAccount]

    if (!claimInfoPerChain) return []

    return Object.keys(claimInfoPerChain).reduce<SupportedChainId[]>((acc, chain) => {
      const checkedChain = chain as unknown as SupportedChainId
      const claimsCountOnChain = claimInfoPerChain[checkedChain]

      if (_shouldNotDisplayBannerForChain(checkedChain, chainId, claimsCountOnChain)) {
        return acc
      }

      acc.push(checkedChain)
      return acc
    }, [])
  }, [activeClaimAccount, chainId, claimInfoPerAccount])

  if (chainsWithClaims.length === 0) {
    return null
  }

  return (
    <NotificationBanner className={className} isVisible id={account ?? undefined} level="info">
      <Wrapper>
        <AlertTriangle />
        <div>This account has available claims on</div>
        <div>
          {chainsWithClaims.map((chainId, index, array) => {
            const changeNetworksCallback = () => callback(chainId)
            const isLastInMultiple = index === array.length - 1 && array.length > 1
            return (
              <Fragment key={chainId}>
                {isLastInMultiple && ' and'}
                <ChainSpan onClick={changeNetworksCallback}>{NETWORK_LABELS[chainId]}</ChainSpan>
              </Fragment>
            )
          })}
        </div>
      </Wrapper>
    </NotificationBanner>
  )
}

export default styled(ClaimsOnOtherChainsBanner)``
