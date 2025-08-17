import { SVJ, Employee, SalaryRecord, EmailTemplate, DashboardStats } from '@/types'

// Mock data pro demonstraci
let mockSVJ: SVJ[] = [
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
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15'),
    registryData: {
      officialName: 'Společenství vlastníků jednotek Vinohrady 123',
      verificationDate: new Date('2024-01-01'),
      isVerified: true
    }
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
    isActive: true,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-01-10'),
    registryData: {
      officialName: 'Společenství vlastníků jednotek Karlín Plaza',
      verificationDate: new Date('2024-01-05'),
      isVerified: true
    }
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
    isActive: true,
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2024-01-05'),
    registryData: {
      officialName: 'Společenství vlastníků jednotek Smíchov Residence',
      verificationDate: new Date('2024-01-02'),
      isVerified: true
    }
  }
]

class ApiService {
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
      id: Math.random().toString(36).slice(2),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockSVJ = [newSVJ, ...mockSVJ]
    return newSVJ
  }

  async updateSVJ(id: string, data: Partial<SVJ>): Promise<SVJ> {
    await new Promise(resolve => setTimeout(resolve, 800))
    const index = mockSVJ.findIndex(svj => svj.id === id)
    if (index === -1) throw new Error('SVJ nenalezeno')
    const updated: SVJ = {
      ...mockSVJ[index],
      ...data,
      updatedAt: new Date()
    }
    mockSVJ = [
      ...mockSVJ.slice(0, index),
      updated,
      ...mockSVJ.slice(index + 1)
    ]
    return updated
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
        socialInsurance: 'OSSZ Praha',
        isActive: true,
        startDate: new Date('2023-01-01'),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        svjId: '2',
        firstName: 'Jana',
        lastName: 'Svobodová',
        address: 'Náměstí Míru 10, 120 00 Praha 2',
        birthNumber: '7552083456',
        phone: '+420 987 654 321',
        email: 'jana.svobodova@email.cz',
        contractType: 'dpp',
        salary: 8000,
        bankAccount: 'CZ9876543210987654321098',
        executions: [{
          id: '1',
          type: 'Alimenty',
          amount: 3000,
          description: 'Srážka na alimenty',
          startDate: new Date('2023-06-01')
        }],
        hasPinkDeclaration: false,
        healthInsurance: '201',
        socialInsurance: 'OSSZ Praha',
        isActive: true,
        startDate: new Date('2023-03-15'),
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date('2024-01-15')
      }
    ]
    
    if (svjId) {
      return mockEmployees.filter(emp => emp.svjId === svjId)
    }
    return mockEmployees
  }

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    await new Promise(resolve => setTimeout(resolve, 800))
    const created: Employee = {
      id: Math.random().toString(36).slice(2),
      svjId: data.svjId || '1',
      firstName: data.firstName || 'Nový',
      lastName: data.lastName || 'Zaměstnanec',
      address: data.address || '',
      birthNumber: data.birthNumber || '',
      phone: data.phone || '',
      email: data.email || '',
      contractType: data.contractType || 'full_time',
      salary: data.salary ?? 0,
      bankAccount: data.bankAccount || '',
      executions: data.executions || [],
      hasPinkDeclaration: !!data.hasPinkDeclaration,
      healthInsurance: data.healthInsurance || '111',
      isActive: data.isActive ?? true,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return created
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    await new Promise(resolve => setTimeout(resolve, 800))
    const list = await this.getEmployees()
    const existing = list.find(e => e.id === id)
    if (!existing) throw new Error('Zaměstnanec nenalezen')
    return {
      ...existing,
      ...data,
      updatedAt: new Date()
    }
  }

  async terminateEmployee(employeeId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Mock implementation - v reálné aplikaci by generovalo výstupní dokumenty
    console.log('Terminating employee:', employeeId)
  }

  // Salary records endpoints
  async getSalaryRecords(_svjId: string, _year: number, _month?: number): Promise<SalaryRecord[]> {
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
  async getEmailTemplates(_svjId?: string): Promise<EmailTemplate[]> {
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
      recentActivities: [],
      userNote: "Nezapomenout zpracovat mzdy pro prosinec do 15. ledna"
    }
  }

  // User note management
  async updateUserNote(note: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    // Mock implementation - in real app would call backend
    console.log('Updating user note:', note)
  }

  // Registry integration - mock
  async verifyIcoInRegistry(ico: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return {
      isVerified: true,
      officialName: "Společenství vlastníků jednotek Na Příkladě 123/45",
      address: "Na Příkladě 123/45, 110 00 Praha 1",
      status: 'active'
    }
  }
}

export const apiService = new ApiService()
export default apiService