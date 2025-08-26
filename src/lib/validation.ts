// Czech bank account & birth number formatting and validation

export function formatBankAccount(input: string): string {
  let v = (input || '').replace(/\s+/g, '')
  // allow only digits, dash and slash
  v = v.replace(/[^0-9/-]/g, '')
  // ensure only one slash
  const parts = v.split('/')
  if (parts.length > 2) {
    v = parts.slice(0, 2).join('/')
  }
  // ensure only one dash in the prefix part
  const [accPart, bankPart] = v.split('/')
  if (accPart && accPart.includes('-')) {
    const idx = accPart.indexOf('-')
    const rest = accPart.slice(idx + 1).replace(/-/g, '')
    v = accPart.slice(0, idx + 1) + rest + (bankPart !== undefined ? '/' + bankPart : '')
  }
  return v
}

export function isValidBankAccount(value: string): boolean {
  if (!value) return false
  const v = value.replace(/\s+/g, '')
  // prefix (0-6 digits + '-') optional, base 2-10 digits, bank code 4 digits
  const re = /^(\d{0,6}-)?\d{2,10}\/\d{4}$/
  return re.test(v)
}

export function formatBirthNumber(input: string): string {
  const digits = (input || '').replace(/\D/g, '')
  if (digits.length <= 6) return digits
  return `${digits.slice(0, 6)}/${digits.slice(6, 10)}`
}

export function isValidBirthNumber(value: string): boolean {
  if (!value) return false
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 9 && digits.length !== 10) return false

  // basic date plausibility
  let mm = parseInt(digits.slice(2, 4), 10)
  const dd = parseInt(digits.slice(4, 6), 10)
  // female +50 months, special cases +20/+70 ignored here
  if (mm > 50) mm -= 50
  if (mm < 1 || mm > 12) return false
  if (dd < 1 || dd > 31) return false

  // modulus check for 10-digit numbers (since 1.1.1954)
  if (digits.length === 10) {
    const num = BigInt(digits)
    if (num % 11n !== 0n) return false
  }
  return true
}
