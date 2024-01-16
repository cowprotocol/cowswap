import { ClaimType } from './types'

const CLAIMS_REPO_BRANCH = 'main'

export const CLAIMS_REPO = `https://raw.githubusercontent.com/cowprotocol/cow-merkle-drop/${CLAIMS_REPO_BRANCH}/`
export const FREE_CLAIM_TYPES: ClaimType[] = [ClaimType.Airdrop, ClaimType.Team, ClaimType.Advisor]
export const PAID_CLAIM_TYPES: ClaimType[] = [ClaimType.GnoOption, ClaimType.UserOption, ClaimType.Investor]
