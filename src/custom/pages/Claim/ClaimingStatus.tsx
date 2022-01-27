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
import { useClaimState } from 'state/claim/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useAllClaimingTransactions } from 'state/enhancedTransactions/hooks'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ExplorerLink } from 'components/ExplorerLink'
import { EnhancedTransactionLink } from 'components/EnhancedTransactionLink'
import { V_COW } from 'constants/tokens'
import AddToMetamask from 'components/AddToMetamask'
import SVG from 'react-inlinesvg'
import twitterImage from 'assets/cow-swap/twitter.svg'
import discordImage from 'assets/cow-swap/discord.svg'
import CowProtocolIcon from 'assets/cow-swap/cowprotocol.svg'
import { ExternalLink } from 'theme'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'
import { shortenAddress } from 'utils'
import CopyHelper from 'components/Copy'

const COW_TWEET_TEMPLATE =
  'I just joined the 🐮 CoWmunity @MEVprotection and claimed my first vCOW tokens! Join me at https://cowswap.exchange/'

export default function ClaimingStatus() {
  const { chainId, account } = useActiveWeb3React()
  const { activeClaimAccount, claimStatus, claimedAmount } = useClaimState()

  const allClaimTxs = useAllClaimingTransactions()
  const lastClaimTx = useMemo(() => {
    const numClaims = allClaimTxs.length
    return numClaims > 0 ? allClaimTxs[numClaims - 1] : undefined
  }, [allClaimTxs])

  // claim status
  const isConfirmed = claimStatus === ClaimStatus.CONFIRMED
  const isAttempting = claimStatus === ClaimStatus.ATTEMPTING
  const isSubmitted = claimStatus === ClaimStatus.SUBMITTED
  const isSelfClaiming = account === activeClaimAccount

  if (!account || !chainId || !activeClaimAccount || claimStatus === ClaimStatus.DEFAULT) return null

  const currency = chainId ? V_COW[chainId] : undefined

  const vCowAmount = currency && CurrencyAmount.fromRawAmount(currency, claimedAmount)

  const formattedVCowAmount = formatSmartLocaleAware(vCowAmount, AMOUNT_PRECISION)
  const formattedMaxVCowAmount = vCowAmount?.greaterThan('0') ? formatMax(vCowAmount, currency?.decimals) : ''

  return (
    <ConfirmOrLoadingWrapper activeBG={true}>
      <ConfirmedIcon isConfirmed={isConfirmed}>
        {!isConfirmed ? (
          <CowSpinner>
            <CowProtocolLogo />
          </CowSpinner>
        ) : (
          <CowProtocolLogo size={100} />
        )}
      </ConfirmedIcon>
      <h3>{isConfirmed ? 'Claim successful!' : 'Claiming'}</h3>
      {!isConfirmed && (
        <Trans>
          <span title={formattedMaxVCowAmount && `${formattedMaxVCowAmount} vCOW`}>{formattedVCowAmount} vCOW</span>
        </Trans>
      )}

      {isConfirmed && (
        <>
          <Trans>
            <h4>
              Congratulations on claiming{' '}
              <b title={formattedMaxVCowAmount && `${formattedMaxVCowAmount} vCOW`}>{formattedVCowAmount} vCOW!</b>
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
            <ExternalLink href="https://chat.cowswap.exchange/">
              <SuccessBanner type={'Discord'}>
                <span>
                  <Trans>Join Discord</Trans>
                </span>
                <SVG src={discordImage} description="Discord" />
              </SuccessBanner>
            </ExternalLink>
            {isSelfClaiming && (
              <Link to="/profile">
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
    </ConfirmOrLoadingWrapper>
  )
}
