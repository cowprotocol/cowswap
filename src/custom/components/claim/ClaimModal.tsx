import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { isAddress } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import Circle from 'assets/images/blue-loader.svg'
import tokenLogo from 'assets/images/token-logo.png'
import { useActiveWeb3React } from 'hooks/web3'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleSelfClaimModal } from 'state/application/hooks'
import { useClaimCallback, useUserClaimData, useUserUnclaimedAmount } from '@src/state/claim/hooks'
import { useUserHasSubmittedClaim } from 'state/transactions/hooks'
import { CloseIcon, CustomLightSpinner, ExternalLink, TYPE, UniTokenAnimated } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn, ColumnCenter } from 'components/Column'
import Confetti from 'components/Confetti'
import { CardBGImageSmaller, CardNoise } from 'components/earn/styled'
import { Trans } from '@lingui/macro'

import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { CheckCircle } from 'react-feather'

const ContentWrapper = styled.div`
  background: linear-gradient(-45deg, #000000 0%, #000000 55%, #202020 100%);
  padding: 32px;
  min-height: 500px;
  width: 100%;
  position: relative;

  ${CloseIcon} {
    position: absolute;
    right: 16px;
    top: 16px;
  }

  h3 {
    font-size: 26px;
    font-weight: 300;
    line-height: 1.2;
    text-align: center;
    margin: 0 0 24px;

    > b {
      font-weight: bold;
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

  p > a {
    display: block;
    margin: 6px 0 0;
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

  > b {
    display: block;
    margin: 0 0 12px;
    font-weight: normal;
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
    font-weight: bold;
  }
`

const ConfirmOrLoadingWrapper = styled.div<{ activeBG: boolean }>`
  width: 100 %;
  padding: 24px;
  position: relative;
  background: ${({ activeBG }) =>
    activeBG &&
    'radial-gradient(76.02% 75.41% at 1.84% 0%, rgba(255, 0, 122, 0.2) 0%, rgba(33, 114, 229, 0.2) 100%), #FFFFFF;'};
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

const USER_AMOUNT = 400

export default function ClaimModal() {
  const isOpen = useModalOpen(ApplicationModal.SELF_CLAIM)
  const toggleClaimModal = useToggleSelfClaimModal()

  const { account, chainId } = useActiveWeb3React()

  // used for UI loading states
  const [attempting, setAttempting] = useState<boolean>(false)

  // get user claim data
  const userClaimData = useUserClaimData(account)

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
    <Modal isOpen={isOpen} onDismiss={toggleClaimModal}>
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

          <p>
            <Trans>
              As an important member of CowSwap Community you may claim vCOW to be used for voting and governance.
              <ExternalLink href="https://cow.fi/">Read more about vCOW</ExternalLink>
            </Trans>
          </p>

          <AmountField>
            <b>You will receive</b>
            <div>
              <CowProtocolLogo size={32} />
              <p>
                {/* <Trans>{unclaimedAmount?.toFixed(0, { groupSeparator: ',' } ?? '-')} vCOW</Trans> */}
                <Trans>120,543.12 vCOW</Trans>
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

          <p>You can claim your tokens until [DATE]</p>

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
        </ContentWrapper>
      )}
      {(attempting || claimConfirmed) && (
        <ConfirmOrLoadingWrapper activeBG={true}>
          <CardNoise />
          <CardBGImageSmaller desaturate />

          <RowBetween>
            <div />
            <CloseIcon onClick={toggleClaimModal} style={{ zIndex: 99 }} stroke="black" />
          </RowBetween>

          <ConfirmedIcon>
            {!claimConfirmed ? (
              <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
            ) : (
              <UniTokenAnimated width="72px" src={tokenLogo} alt="vCOW" />
            )}
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify={'center'}>
            <AutoColumn gap="12px" justify={'center'}>
              <TYPE.largeHeader fontWeight={600} color="black">
                {claimConfirmed ? 'Claimed!' : 'Claiming'}
              </TYPE.largeHeader>
              {!claimConfirmed && (
                <Text fontSize={36} color={'#ff007a'} fontWeight={800}>
                  <Trans>{unclaimedAmount?.toFixed(0, { groupSeparator: ',' } ?? '-')} vCOW</Trans>
                </Text>
              )}
            </AutoColumn>
            {claimConfirmed && (
              <>
                <TYPE.subHeader fontWeight={500} color="black">
                  <Trans>
                    <span role="img" aria-label="party-hat">
                      🎉{' '}
                    </span>
                    Welcome to team Unicorn :){' '}
                    <span role="img" aria-label="party-hat">
                      🎉
                    </span>
                  </Trans>
                </TYPE.subHeader>
              </>
            )}
            {attempting && !claimSubmitted && (
              <TYPE.subHeader color="black">
                <Trans>Confirm this transaction in your wallet</Trans>
              </TYPE.subHeader>
            )}
            {attempting && claimSubmitted && !claimConfirmed && chainId && claimTxn?.hash && (
              <ExternalLink
                href={getExplorerLink(chainId, claimTxn?.hash, ExplorerDataType.TRANSACTION)}
                style={{ zIndex: 99 }}
              >
                <Trans>View transaction on Explorer</Trans>
              </ExternalLink>
            )}
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
    </Modal>
  )
}
