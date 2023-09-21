import { useMemo } from 'react'

import CowProtocolIcon from '@cowprotocol/assets/cow-swap/cowprotocol.svg'
import discordImage from '@cowprotocol/assets/cow-swap/discord.svg'
import twitterImage from '@cowprotocol/assets/cow-swap/twitter.svg'
import { V_COW } from '@cowprotocol/common-const'
import { shortenAddress } from '@cowprotocol/common-utils'
import { TokenAmount, ButtonSecondary } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'
import { Link } from 'react-router-dom'

import CopyHelper from 'legacy/components/Copy'
import CowProtocolLogo from 'legacy/components/CowProtocolLogo'
import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { ExplorerLink } from 'legacy/components/ExplorerLink'
import { ClaimStatus } from 'legacy/state/claim/actions'
import { useClaimDispatchers, useClaimState } from 'legacy/state/claim/hooks'
import { ClaimCommonTypes } from 'legacy/state/claim/types'
import { useAllClaimingTransactions } from 'legacy/state/enhancedTransactions/hooks'

import { AddToMetamask } from 'modules/wallet/containers/AddToMetamask'

import { Routes } from 'common/constants/routes'
import {
  ConfirmOrLoadingWrapper,
  ConfirmedIcon,
  AttemptFooter,
  CowSpinner,
  BannersWrapper,
  SuccessBanner,
} from 'pages/Claim/styled'

const COW_TWEET_TEMPLATE =
  'I just joined the 🐮 CoWmunity @CoWSwap and claimed my first vCOW tokens! Join me at https://swap.cow.fi/'

type ClaimNavProps = Pick<ClaimCommonTypes, 'handleChangeAccount'>

export default function ClaimingStatus({ handleChangeAccount }: ClaimNavProps) {
  const { chainId, account } = useWalletInfo()
  const { activeClaimAccount, claimStatus, claimedAmount } = useClaimState()

  const { setClaimStatus } = useClaimDispatchers()

  const allClaimTxs = useAllClaimingTransactions()
  const lastClaimTx = useMemo(() => {
    const numClaims = allClaimTxs.length
    return numClaims > 0 ? allClaimTxs[numClaims - 1] : undefined
  }, [allClaimTxs])

  // claim status
  const isConfirmed = claimStatus === ClaimStatus.CONFIRMED
  const isAttempting = claimStatus === ClaimStatus.ATTEMPTING
  const isSubmitted = claimStatus === ClaimStatus.SUBMITTED
  const isFailure = claimStatus === ClaimStatus.FAILED
  const isSelfClaiming = account === activeClaimAccount

  if (!account || !chainId || !activeClaimAccount || claimStatus === ClaimStatus.DEFAULT) return null

  const currency = chainId ? V_COW[chainId] : undefined

  const vCowAmount = currency && CurrencyAmount.fromRawAmount(currency, claimedAmount)

  const formattedVCowAmount = <TokenAmount amount={vCowAmount} defaultValue="" tokenSymbol={currency} />

  return (
    <ConfirmOrLoadingWrapper activeBG={true}>
      <ConfirmedIcon isConfirmed={isConfirmed}>
        {!isConfirmed && !isFailure ? (
          <CowSpinner>
            <CowProtocolLogo />
          </CowSpinner>
        ) : (
          <CowProtocolLogo size={100} />
        )}
      </ConfirmedIcon>
      <h3>{isConfirmed ? 'Claim successful!' : isFailure ? 'Failed to claim' : 'Claiming'}</h3>
      {!isConfirmed && formattedVCowAmount}

      {isConfirmed && (
        <>
          <Trans>
            <h4>
              Congratulations on claiming <b>{formattedVCowAmount}!</b>
              {isSelfClaiming ? (
                <AddToMetamask currency={currency} />
              ) : (
                <div>
                  <p>
                    You have just claimed on behalf of{' '}
                    <b>
                      <ExplorerLink
                        id={activeClaimAccount}
                        label={shortenAddress(activeClaimAccount)}
                        type="token-transfer"
                      />
                      <CopyHelper toCopy={activeClaimAccount} />
                    </b>
                  </p>
                </div>
              )}
            </h4>
            <p>
              <span role="img" aria-label="party-hat">
                🎉🐮{' '}
              </span>
              Welcome to the CoWmunity! We encourage you to share on Twitter and join the community on Discord to get
              involved in governance.
            </p>
          </Trans>

          <BannersWrapper>
            <ExternalLink href={`https://twitter.com/intent/tweet?text=${COW_TWEET_TEMPLATE}`}>
              <SuccessBanner type={'Twitter'}>
                <span>
                  <Trans>Share on Twitter</Trans>
                </span>
                <SVG src={twitterImage} description="Twitter" />
              </SuccessBanner>
            </ExternalLink>
            <ExternalLink href="https://discord.com/invite/cowprotocol/">
              <SuccessBanner type={'Discord'}>
                <span>
                  <Trans>Join Discord</Trans>
                </span>
                <SVG src={discordImage} description="Discord" />
              </SuccessBanner>
            </ExternalLink>
            {isSelfClaiming && (
              <Link to={Routes.ACCOUNT}>
                <SuccessBanner type={'Profile'}>
                  <span>
                    <Trans>View vCOW balance</Trans>
                  </span>
                  <SVG src={CowProtocolIcon} description="Profile" />
                </SuccessBanner>
              </Link>
            )}
          </BannersWrapper>
        </>
      )}
      {isAttempting && (
        <AttemptFooter>
          <p>
            <Trans>Confirm this transaction in your wallet</Trans>
          </p>
        </AttemptFooter>
      )}
      {isSubmitted && chainId && lastClaimTx?.hash && <EnhancedTransactionLink chainId={chainId} tx={lastClaimTx} />}

      {isFailure && (
        <>
          {chainId && lastClaimTx?.hash && <EnhancedTransactionLink chainId={chainId} tx={lastClaimTx} />}
          <AttemptFooter>
            <p>The claim transaction failed. Please check the network parameters and try again.</p>
          </AttemptFooter>
        </>
      )}
      {isFailure && (
        <ButtonSecondary onClick={() => setClaimStatus(ClaimStatus.DEFAULT)}>
          <Trans>Go back</Trans>
        </ButtonSecondary>
      )}
      {isConfirmed && (
        <ButtonSecondary onClick={handleChangeAccount}>
          <Trans>Claim for another account</Trans>
        </ButtonSecondary>
      )}
    </ConfirmOrLoadingWrapper>
  )
}
