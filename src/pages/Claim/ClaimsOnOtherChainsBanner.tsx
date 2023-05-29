import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

import NotificationBanner from 'legacy/components/NotificationBanner'
import { useClaimState } from 'legacy/state/claim/hooks'
import { ClaimInfo } from 'legacy/state/claim/reducer'

import { useWalletInfo } from 'modules/wallet'

// const ChainSpan = styled.span``
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
    Number(checkedChain) === chainId ||
    // If total claims is 0
    total === 0 ||
    // If there are no available
    available === 0
  )
}

function ClaimsOnOtherChainsBanner({ className }: { className?: string }) {
  const { account, chainId } = useWalletInfo()

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
    <NotificationBanner className={className} isVisible id={account ?? undefined} level="info" canClose={false}>
      <Wrapper>
        <AlertTriangle />
        <div>This account has available claims on</div>
        {/* <div>
          {chainsWithClaims.map((chainId, index, array) => {
            const changeNetworksCallback = () =>
              handleChainSwitch(chainId, { skipToggle: true, skipWalletToggle: false }) // true to avoid opening the dropdown
            const isLastInMultiple = index === array.length - 1 && array.length > 1
            return (
              <Fragment key={chainId}>
                {isLastInMultiple && ' and'}
                <ChainSpan onClick={changeNetworksCallback}>{CHAIN_INFO[chainId].label}</ChainSpan>
              </Fragment>
            )
          })}
        </div> */}
      </Wrapper>
    </NotificationBanner>
  )
}

export default styled(ClaimsOnOtherChainsBanner)``
