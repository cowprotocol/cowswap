export function generateReferralCode(): string {
  // Generate a random string of 8 characters (numbers and uppercase letters)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const codeLength = 8
  let code = 'CHAMELEON'
  
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    code += characters.charAt(randomIndex)
  }
  
  return code
}