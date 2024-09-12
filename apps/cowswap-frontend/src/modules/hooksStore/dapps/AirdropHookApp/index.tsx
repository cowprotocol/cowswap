import { useCallback, useContext, useState } from 'react'

import { formatTokenAmount } from '@cowprotocol/common-utils'
import { HookDappInternal, HookDappType } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { Fraction } from '@uniswap/sdk-core'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useGasLimit } from 'modules/hooksStore/hooks/useGasLimitHooks'

import { AIRDROP_OPTIONS } from './constants'
import { useClaimData } from './hooks/useClaimData'
import { ContentWrapper } from './styled/ContentWrapper'
import { DropDownMenu } from './styled/DropDown'
import { Header } from './styled/Header'
import { Link } from './styled/Link'
import { Row } from './styled/Row'
import { Wrapper } from './styled/Wrapper'
import { AirdropOption, IClaimData } from './types'

import { HookDappContext } from '../../context'

const NAME = 'Airdrop'
const DESCRIPTION = 'Claim an aidrop before swapping!'
const IMAGE_URL =
  'https://static.vecteezy.com/system/resources/previews/017/317/302/original/an-icon-of-medical-airdrop-editable-and-easy-to-use-vector.jpg'

export const PRE_AIRDROP: HookDappInternal = {
  name: NAME,
  description: DESCRIPTION,
  type: HookDappType.INTERNAL,
  path: '/hooks-dapps/pre/build',
  image: IMAGE_URL,
  component: <AirdropHookApp />,
  version: '0.1.0',
}

export function AirdropHookApp() {
  const hookDappContext = useContext(HookDappContext)
  const [selectedAirdrop, setSelectedAirdrop] = useState<AirdropOption>()
  const { data: claimData, isValidating, error } = useClaimData(selectedAirdrop)
  const gasLimit = useGasLimit(claimData?.contract.address, claimData?.callData)

  const clickOnAddHook = useCallback(async () => {
    if (!hookDappContext || !claimData || !gasLimit) return

    hookDappContext.addHook(
      {
        hook: {
          target: claimData.contract.address,
          callData: claimData.callData,
          gasLimit,
        },
        dapp: PRE_AIRDROP,
        outputTokens: [CurrencyAmount.fromRawAmount(claimData.token, claimData.amount)],
      },
      true
    )
  }, [hookDappContext, claimData, gasLimit])

  const canClaim = claimData?.amount && !claimData?.isClaimed

  return (
    <Wrapper>
      <Header>
        <img src={IMAGE_URL} alt={NAME} width="120" />
        <p>{DESCRIPTION}</p>
      </Header>
      <ContentWrapper>
        <Row>
          <DropDownMenu airdropOptions={AIRDROP_OPTIONS} setSelectedAirdrop={setSelectedAirdrop} />
        </Row>
        {selectedAirdrop && <AirdropMessage claimData={claimData} error={error} isValidating={isValidating} />}
      </ContentWrapper>
      <ButtonPrimary disabled={!canClaim || isValidating} onClick={clickOnAddHook}>
        +Add Pre-hook
      </ButtonPrimary>
      <Link
        onClick={(e) => {
          e.preventDefault()
          hookDappContext?.close()
        }}
      >
        Close
      </Link>
    </Wrapper>
  )
}

function AirdropMessage({
  claimData,
  error,
  isValidating,
}: {
  claimData?: IClaimData
  error?: Error
  isValidating?: boolean
}) {
  if (isValidating) {
    return <Row>Loading...</Row>
  }

  if (error) {
    return <Row>{error.message}</Row>
  }

  if (!claimData?.amount) {
    return <Row>You are not eligible for this airdrop</Row>
  }

  const tokenAmount = formatTokenAmount(new Fraction(claimData.amount, 10 ** 18))
  const message = claimData?.isClaimed
    ? `You have already claimed this airdrop`
    : `You have ${tokenAmount} ${claimData?.token.symbol} to claim`
  return <Row>{message}</Row>
}
