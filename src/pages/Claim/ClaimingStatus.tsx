import { CurrencyAmount } from '@uniswap/sdk-core'
import { Trans } from '@lingui/macro'
import {
  ConfirmOrLoadingWrapper,
  ConfirmedIcon,
  AttemptFooter,
  CowSpinner,
  BannersWrapper,
  SuccessBanner,
} from 'pages/Claim/styled'
import { ClaimStatus } from 'state/claim/actions'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useAllClaimingTransactions } from 'state/enhancedTransactions/hooks'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ExplorerLink } from 'components/ExplorerLink'
import { EnhancedTransactionLink } from 'components/EnhancedTransactionLink'
import { V_COW } from 'constants/tokens'
import AddToMetamask from 'modules/wallet/web3-react/containers/AddToMetamask'
import SVG from 'react-inlinesvg'
import twitterImage from '@src/legacy/assets/cow-swap/twitter.svg'
import discordImage from '@src/legacy/assets/cow-swap/discord.svg'
import CowProtocolIcon from '@src/legacy/assets/cow-swap/cowprotocol.svg'
import { ExternalLink } from 'theme'
import { shortenAddress } from 'utils'
import CopyHelper from 'components/Copy'
import { ButtonSecondary } from 'components/Button'
import { ClaimCommonTypes } from './types'
import { Routes } from 'constants/routes'
import { TokenAmount } from 'common/pure/TokenAmount'
import { useWalletInfo } from 'modules/wallet'

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
      {isSubmitted && chainId && lastClaimTx?.hash && <EnhancedTransactionLink tx={lastClaimTx} />}

      {isFailure && (
        <>
          {chainId && lastClaimTx?.hash && <EnhancedTransactionLink tx={lastClaimTx} />}
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
