import { useCallback, useState } from 'react'

import { formatTokenAmount } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'
import { Fraction } from '@uniswap/sdk-core'

import { useGasLimit } from 'modules/hooksStore/hooks/useGasLimitHooks'
import { HookDappProps } from 'modules/hooksStore/types/hooks'

import { AIRDROP_OPTIONS } from './constants'
import { useClaimData } from './hooks/useClaimData'
import { ContentWrapper } from './styled/ContentWrapper'
import { DropDownMenu } from './styled/DropDown'
import { Link } from './styled/Link'
import { Row } from './styled/Row'
import { Wrapper } from './styled/Wrapper'
import { AirdropOption, IClaimData } from './types'



export function AirdropHookApp({ context }: HookDappProps) {
  const [selectedAirdrop, setSelectedAirdrop] = useState<AirdropOption>()
  const { data: claimData, isValidating, error } = useClaimData(selectedAirdrop)
  const gasLimit = useGasLimit(claimData?.contract.address, claimData?.callData)

  const clickOnAddHook = useCallback(async () => {
    if (!context || !claimData || !gasLimit) return

    context.addHook({
      hook: {
        target: claimData.contract.address,
        callData: claimData.callData,
        gasLimit,
      },
    })
  }, [context, claimData, gasLimit])

  const canClaim = claimData?.amount && !claimData?.isClaimed

  return (
    <Wrapper>
      <ContentWrapper>
        <Row>
          <label style={{width:"fit-content",fontWeight:"600"}}>Select Airdrop</label>
          <DropDownMenu airdropOptions={AIRDROP_OPTIONS} setSelectedAirdrop={setSelectedAirdrop} />
        </Row>
        <Row>
          <div style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            padding:"0.75rem",
            backgroundColor:"#ECF1F8",
            marginTop:"0.5rem",
            marginBottom:"0.5rem",
            borderRadius:"0.75rem"
          }}>
            <span>Total Available to claim</span>
            <span>0.00 GNO</span>
          </div>
        </Row>
        {selectedAirdrop && <AirdropMessage claimData={claimData} error={error} isValidating={isValidating} />}
      </ContentWrapper>
      <ButtonPrimary disabled={!canClaim || isValidating} onClick={clickOnAddHook}>
        +Add Pre-hook
      </ButtonPrimary>
      <Link
        onClick={(e) => {
          e.preventDefault()
          context.close()
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
