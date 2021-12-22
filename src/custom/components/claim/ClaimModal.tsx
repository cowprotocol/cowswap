import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { isAddress } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
// import { Text } from 'rebass'
import styled from 'styled-components/macro'
import Circle from 'assets/images/blue-loader.svg'
// import tokenLogo from 'assets/images/token-logo.png'
import { useActiveWeb3React } from 'hooks/web3'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleSelfClaimModal } from 'state/application/hooks'
import {
  useClaimCallback,
  // useUserClaimData,
  useUserUnclaimedAmount,
} from '@src/state/claim/hooks'
import { useUserHasSubmittedClaim } from 'state/transactions/hooks'
import {
  CloseIcon,
  CustomLightSpinner,
  ExternalLink,
  // TYPE,
  // UniTokenAnimated
} from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { ButtonPrimary } from 'components/Button'
import {
  // AutoColumn,
  ColumnCenter,
} from 'components/Column'
import Confetti from 'components/Confetti'
// import { CardBGImageSmaller, CardNoise } from 'components/earn/styled'
import { Trans } from '@lingui/macro'

import { GpModal } from 'components/Modal'
// import { RowBetween } from 'components/Row'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { CheckCircle } from 'react-feather'

const ContentWrapper = styled.div`
  background: linear-gradient(315deg, #000000 0%, #000000 55%, #202020 100%);
  padding: 32px;
  min-height: 500px;
  height: 100%;
  width: 100%;
  position: relative;
  color: #bbbbbb;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 20px;
    min-height: initial;
  `};

  ${CloseIcon} {
    position: absolute;
    right: 16px;
    top: 16px;
  }

  > button {
    background: rgb(237, 104, 52);
    border: 0;
    box-shadow: none;
    color: black;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 auto 24px;
    `};

    &:hover {
      border: 0;
      box-shadow: none;
      transform: none;
      background: rgb(247 127 80);
      color: black;
    }
  }

  h3 {
    font-size: 26px;
    font-weight: 300;
    line-height: 1.2;
    text-align: center;
    margin: 0 0 24px;
    color: white;

    > b {
      font-weight: 600;
    }
  }

  p {
    font-size: 16px;
    display: block;
    line-height: 1.6;
    font-weight: 300;
    margin: 24px auto;
    text-align: center;
  }

  p > i {
    color: rgb(237, 104, 52);
  }

  p > a {
    display: block;
    margin: 24px 0 0;
    color: rgb(237, 104, 52);
  }
`

const CheckIcon = styled(CheckCircle)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
  stroke: rgb(237, 104, 52);
`

const EligibleBanner = styled.div`
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  display: flex;
  background: rgba(237, 104, 52, 0.1);
  flex-flow: row;
  border: 0.1rem solid rgb(237, 104, 52);
  color: rgb(237, 104, 52);
  justify-content: center;
  align-items: center;
  margin: 0 auto 16px;
`

const TopWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
`

const AmountField = styled.div`
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(151, 151, 151, 0.4);
  background: rgba(151, 151, 151, 0.1);
  width: 100%;
  margin: 0 0 16px;

  > b {
    display: block;
    margin: 0 0 12px;
    font-weight: normal;
    color: #979797;
  }

  > div {
    display: flex;
    width: 100%;
  }

  > div > p {
    display: flex;
    align-items: center;
    margin: 0 0 0 6px;
    padding: 0;
    font-size: 22px;
    font-weight: 600;
    color: white;
  }
`

const ConfirmOrLoadingWrapper = styled.div<{ activeBG: boolean }>`
  width: 100%;
  padding: 24px;
  color: white;
  position: relative;
  background: linear-gradient(315deg, #000000 0%, #000000 55%, #202020 100%);
  /* background: ${({ activeBG }) =>
    activeBG &&
    'radial-gradient(76.02% 75.41% at 1.84% 0%, rgba(255, 0, 122, 0.2) 0%, rgba(33, 114, 229, 0.2) 100%), #FFFFFF;'}; */

  ${CloseIcon} {
    position: absolute;
    right: 16px;
    top: 16px;
  }

  h3 {
    font-size: 26px;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    margin: 0 0 24px;
    color: white;
  }
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

const AttemptFooter = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;

  > p {
    font-size: 14px;
  }
`

// const USER_AMOUNT = 400

export default function ClaimModal() {
  const isOpen = useModalOpen(ApplicationModal.SELF_CLAIM)
  const toggleClaimModal = useToggleSelfClaimModal()

  const { account, chainId } = useActiveWeb3React()

  // used for UI loading states
  const [attempting, setAttempting] = useState<boolean>(false)

  // get user claim data
  // const userClaimData = useUserClaimData(account)

  // monitor the status of the claim from contracts and txns
  const { claimCallback } = useClaimCallback(account)
  const unclaimedAmount: CurrencyAmount<Token> | undefined = useUserUnclaimedAmount(account)
  const { claimSubmitted, claimTxn } = useUserHasSubmittedClaim(account ?? undefined)
  const claimConfirmed = Boolean(claimTxn?.receipt)

  function onClaim() {
    setAttempting(true)
    claimCallback()
      // reset modal and log error
      .catch((error) => {
        setAttempting(false)
        console.log(error)
      })
  }

  // once confirmed txn is found, if modal is closed open, mark as not attempting regradless
  useEffect(() => {
    if (claimConfirmed && claimSubmitted && attempting) {
      setAttempting(false)
      if (!isOpen) {
        toggleClaimModal()
      }
    }
  }, [attempting, claimConfirmed, claimSubmitted, isOpen, toggleClaimModal])

  return (
    <GpModal isOpen={isOpen} onDismiss={toggleClaimModal} maxWidth={510} backgroundColor={'black'} border={'none'}>
      <Confetti start={Boolean(isOpen && claimConfirmed)} />
      {!attempting && !claimConfirmed && (
        <ContentWrapper>
          <CloseIcon onClick={toggleClaimModal} style={{ zIndex: 99 }} color="white" />

          <TopWrapper>
            <CowProtocolLogo size={100} />
          </TopWrapper>

          <h3>
            <Trans>
              Claim <b>vCOW</b>
            </Trans>
          </h3>

          <EligibleBanner>
            <CheckIcon />
            <Trans>You are eligible for the airdrop!</Trans>
          </EligibleBanner>

          <AmountField>
            <b>Available to claim</b>
            <div>
              <CowProtocolLogo size={32} />
              <p>
                {/* <Trans>{unclaimedAmount?.toFixed(0, { groupSeparator: ',' } ?? '-')} vCOW</Trans> */}
                120,543.12 vCOW
              </p>
            </div>

            {/* {userClaimData?.flags?.isUser && (
            <div>
              {' '}
              <Trans>User</Trans>
              <Trans>{USER_AMOUNT} vCOW</Trans>
            </div>
          )} */}
          </AmountField>

          <p>
            <Trans>
              As an important member of the CowSwap Community you may claim vCOW to be used for voting and governance.
              You can claim your tokens until <i>[XX-XX-XXXX - XX:XX GMT]</i>
              <ExternalLink href="https://cow.fi/">Read more about vCOW</ExternalLink>
            </Trans>
          </p>

          <ButtonPrimary
            disabled={!isAddress(account ?? '')}
            padding="16px 16px"
            width="100%"
            $borderRadius="12px"
            mt="1rem"
            onClick={onClaim}
          >
            <Trans>Claim vCOW</Trans>
          </ButtonPrimary>

          <ExternalLink href="#">Check for another wallet</ExternalLink>
        </ContentWrapper>
      )}

      {(attempting || claimConfirmed) && (
        <ConfirmOrLoadingWrapper activeBG={true}>
          <CloseIcon onClick={toggleClaimModal} style={{ zIndex: 99 }} color="white" />

          <ConfirmedIcon>
            {!claimConfirmed ? (
              <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
            ) : (
              <CowProtocolLogo size={100} />
            )}
          </ConfirmedIcon>

          <h3>{claimConfirmed ? 'Claimed!' : 'Claiming'}</h3>

          {!claimConfirmed && (
            <p>
              <Trans>{unclaimedAmount?.toFixed(0, { groupSeparator: ',' } ?? '-')} vCOW</Trans>
            </p>
          )}

          {claimConfirmed && (
            <>
              <Trans>
                <span role="img" aria-label="party-hat">
                  🎉{' '}
                </span>
                Welcome to team Unicorn :){' '}
                <span role="img" aria-label="party-hat">
                  🎉
                </span>
              </Trans>
            </>
          )}

          {attempting && !claimSubmitted && (
            <AttemptFooter>
              <p>
                <Trans>Confirm this transaction in your wallet</Trans>
              </p>
            </AttemptFooter>
          )}

          {attempting && claimSubmitted && !claimConfirmed && chainId && claimTxn?.hash && (
            <ExternalLink
              href={getExplorerLink(chainId, claimTxn?.hash, ExplorerDataType.TRANSACTION)}
              style={{ zIndex: 99 }}
            >
              <Trans>View transaction on Explorer</Trans>
            </ExternalLink>
          )}
        </ConfirmOrLoadingWrapper>
      )}
    </GpModal>
  )
}
