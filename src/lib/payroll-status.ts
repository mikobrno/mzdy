export type DbPayrollStatus = 'pending' | 'approved'

/** Map any FE/legacy status to a DB-valid status */
export function toDbStatus(input?: string | null): DbPayrollStatus {
  const s = String(input ?? '').toLowerCase().trim()
  if (s === 'approved' || s === 'paid') return 'approved'
  // default everything else to 'pending' (draft, prepared, empty, unknown)
  return 'pending'
}

/** Default status when creating a new payroll */
export const DEFAULT_DB_PAYROLL_STATUS: DbPayrollStatus = 'pending'
