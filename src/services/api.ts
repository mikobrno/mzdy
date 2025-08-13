import { SVJ, Employee, SalaryRecord, EmailTemplate, DashboardStats } from '@/types'

// Mock data pro demonstraci
const mockSVJ: SVJ[] = [
  {
    id: '1',
    name: 'SVJ Vinohrady 123',
    ico: '12345678',
    address: 'Vinohrady 123, 120 00 Praha 2',
    bankAccount: 'CZ6508000000192000145399',
    dataBoxId: 'abc123xyz',
    contactPerson: 'Marie Svobodová',
    contactEmail: 'marie@svj-vinohrady.cz',
    quickDescription: 'Bytový dům na Vinohradech - 45 jednotek',
    reportDeliveryMethod: 'manager',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'SVJ Karlín Plaza',
    ico: '87654321',
    address: 'Karlínské náměstí 10, 186 00 Praha 8',
    bankAccount: 'CZ9401000000123456789012',
    dataBoxId: 'xyz789abc',
    contactPerson: 'Tomáš Dvořák',
    contactEmail: 'tomas@karlin-plaza.cz',
    quickDescription: 'Moderní komplex - 78 bytů + komerční prostory',
    reportDeliveryMethod: 'client',
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'SVJ Smíchov Residence',
    ico: '11223344',
    address: 'Smíchovská 50, 150 00 Praha 5',
    bankAccount: 'CZ7601000000987654321098',
    dataBoxId: 'smichov123',
    contactPerson: 'Jana Nováková',
    contactEmail: 'jana@smichov-residence.cz',
    quickDescription: 'Luxusní bytový komplex - 32 jednotek',
    reportDeliveryMethod: 'manager',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2024-01-05')
  }
]

class ApiService {
  private baseUrl = '/api'

  // SVJ endpoints
  async getSVJList(): Promise<SVJ[]> {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockSVJ
  }

  async getSVJ(id: string): Promise<SVJ | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockSVJ.find(svj => svj.id === id) || null
  }

  async createSVJ(data: Omit<SVJ, 'id' | 'createdAt' | 'updatedAt'>): Promise<SVJ> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newSVJ: SVJ = {
      ...data,
      id: Math.random().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return newSVJ
  }

  async updateSVJ(id: string, data: Partial<SVJ>): Promise<SVJ> {
    await new Promise(resolve => setTimeout(resolve, 800))
    const existing = mockSVJ.find(svj => svj.id === id)
    if (!existing) throw new Error('SVJ nenalezeno')
    
    return {
      ...existing,
      ...data,
      updatedAt: new Date()
    }
  }

  // Employees endpoints
  async getEmployees(svjId?: string): Promise<Employee[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    const mockEmployees: Employee[] = [
      {
        id: '1',
        svjId: '1',
        firstName: 'Petr',
        lastName: 'Novák',
        address: 'Hlavní 15, 110 00 Praha 1',
        birthNumber: '8001015678',
        phone: '+420 123 456 789',
        email: 'petr.novak@email.cz',
        contractType: 'committee_member',
        salary: 15000,
        bankAccount: 'CZ5508000000001234567890',
        executions: [],
        hasPinkDeclaration: true,
        healthInsurance: '111',
        isActive: true,
        startDate: new Date('2023-01-01'),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]
    
    if (svjId) {
      return mockEmployees.filter(emp => emp.svjId === svjId)
    }
    return mockEmployees
  }

  // Salary records endpoints
  async getSalaryRecords(svjId: string, year: number, month?: number): Promise<SalaryRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 700))
    return []
  }

  async createSalaryRecord(data: Omit<SalaryRecord, 'id' | 'createdAt'>): Promise<SalaryRecord> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return {
      ...data,
      id: Math.random().toString(),
      createdAt: new Date()
    }
  }

  // Email templates endpoints
  async getEmailTemplates(svjId?: string): Promise<EmailTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return [
      {
        id: '1',
        name: 'Výplatní pásky',
        subject: 'Výplatní páska pro {{aktualni_mesic}}',
        body: 'Dobrý den {{osloveni_vyboru}},\n\nv příloze zasíláme výplatní pásky za měsíc {{aktualni_mesic}}.\n\nS pozdravem,\nMzdové účetnictví',
        variables: [
          { key: 'aktualni_mesic', type: 'system', description: 'Aktuální měsíc' },
          { key: 'osloveni_vyboru', type: 'dynamic', description: 'Oslovení výboru' }
        ],
        isGlobal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      totalSvj: 3,
      totalEmployees: 12,
      pendingSalaries: 8,
      completedSalariesThisMonth: 4,
      pendingCampaigns: 2,
      recentActivities: []
    }
  }
}

export const apiService = new ApiService()
export default apiService