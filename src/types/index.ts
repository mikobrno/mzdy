export interface SVJ {
  id: string
  name: string
  ico: string
  address: string
  bankAccount: string
  dataBoxId: string
  contactPerson: string
  contactEmail: string
  quickDescription: string
  reportDeliveryMethod: 'manager' | 'client'
  isActive?: boolean
  registryData?: {
    officialName: string
    verificationDate: Date
    isVerified: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface Employee {
  id: string
  svjId: string
  firstName: string
  lastName: string
  address: string
  birthNumber: string
  phone: string
  email: string
  contractType: 'dpp' | 'committee_member' | 'full_time'
  salary: number
  bankAccount: string
  executions: Execution[]
  hasPinkDeclaration: boolean
  healthInsurance: string
  socialInsurance?: string
  isActive: boolean
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Execution {
  id: string
  type: string
  amount: number
  description: string
  startDate: Date
  endDate?: Date
}

export interface SalaryRecord {
  id: string
  employeeId: string
  svjId: string
  year: number
  month: number
  grossSalary: number
  netSalary: number
  healthInsurance: number
  socialInsurance: number
  tax: number
  status: 'draft' | 'prepared' | 'approved' | 'paid'
  createdBy: string
  approvedBy?: string
  createdAt: Date
  approvedAt?: Date
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: TemplateVariable[]
  isGlobal: boolean
  svjId?: string
  createdAt: Date
  updatedAt: Date
}

export interface TemplateVariable {
  key: string
  type: 'static' | 'dynamic' | 'system'
  value?: string
  description: string
}

export interface EmailCampaign {
  id: string
  templateId: string
  svjIds: string[]
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  scheduledAt?: Date
  sentAt?: Date
  attachments: EmailAttachment[]
  createdAt: Date
}

export interface EmailAttachment {
  id: string
  name: string
  type: 'manual' | 'system' | 'cloud'
  url?: string
  size?: number
  mimeType?: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'super_admin' | 'main_accountant' | 'payroll_accountant' | 'committee_member' | 'employee'
  permissions: string[]
  svjIds?: string[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  oldValue?: any
  newValue?: any
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export interface DashboardStats {
  totalSvj: number
  totalEmployees: number
  pendingSalaries: number
  completedSalariesThisMonth: number
  pendingCampaigns: number
  recentActivities: AuditLog[]
  userNote?: string
}

export interface VariableGroup {
  category: string
  variables: string[]
}

export interface GlobalSettings {
  id: string
  companyName: string
  contactEmail: string
  smtpSettings: {
    host: string
    port: number
    secure: boolean
    username: string
    password: string
  }
  defaultVariables: {
    [key: string]: string
  }
  taxSettings: {
    currentYear: number
    taxRates: {
      [key: string]: number
    }
  }
}