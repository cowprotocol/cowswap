export function unlockCrossChainSwap(): void {
  cy.get('#unlock-cross-chain-swap-btn').should('be.visible').click()
}
