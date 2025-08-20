import { apolloClient } from '@/lib/apollo'
import {
  GET_SVJ_LIST,
  GET_SVJ_DETAIL,
  GET_EMPLOYEES,
  GET_EMPLOYEE_DETAIL,
  GET_SVJ_WITH_PAYROLLS,
  GET_PAYROLL_SUMMARY,
  GET_PAYROLL_DETAIL,
  GET_DASHBOARD_STATS,
  CREATE_SVJ,
  UPDATE_SVJ,
  CREATE_EMPLOYEE,
  UPDATE_EMPLOYEE,
  CREATE_PAYROLL,
  UPDATE_PAYROLL_STATUS
} from '@/lib/graphql-queries'
import { SVJ, Employee, SalaryRecord, EmailTemplate, DashboardStats } from '@/types'

class NhostApiService {
  // SVJ endpoints
  async getSVJList(): Promise<SVJ[]> {
    const { data } = await apolloClient.query({
      query: GET_SVJ_LIST,
      fetchPolicy: 'cache-first'
    })
    
    return data.svjs.map(this.mapNhostSVJ)
  }

  async getSVJ(id: string): Promise<SVJ | null> {
    try {
      const { data } = await apolloClient.query({
        query: GET_SVJ_DETAIL,
        variables: { id },
        fetchPolicy: 'cache-first'
      })
      
      return data.svjs_by_pk ? this.mapNhostSVJ(data.svjs_by_pk) : null
    } catch (error) {
      console.error('Error fetching SVJ:', error)
      return null
    }
  }

  async createSVJ(data: Omit<SVJ, 'id' | 'createdAt' | 'updatedAt'>): Promise<SVJ> {
    const { data: result } = await apolloClient.mutate({
      mutation: CREATE_SVJ,
      variables: {
        data: {
          name: data.name,
          ico: data.ico,
          dic: data.dic,
          address: data.address,
          bank_account: data.bankAccount,
          contact_person: data.contactPerson,
          contact_email: data.contactEmail,
          is_active: data.isActive
        }
      }
    })
    
    return this.mapNhostSVJ(result.insert_svjs_one)
  }

  async updateSVJ(id: string, data: Partial<SVJ>): Promise<SVJ> {
    const { data: result } = await apolloClient.mutate({
      mutation: UPDATE_SVJ,
      variables: {
        id,
        data: {
          name: data.name,
          ico: data.ico,
          dic: data.dic,
          address: data.address,
          bank_account: data.bankAccount,
          contact_person: data.contactPerson,
          contact_email: data.contactEmail,
          is_active: data.isActive
        }
      }
    })
    
    return this.mapNhostSVJ(result.update_svjs_by_pk)
  }

  // Employees endpoints
  async getEmployees(svjId?: string): Promise<Employee[]> {
    const { data } = await apolloClient.query({
      query: GET_EMPLOYEES,
      variables: { svjId },
      fetchPolicy: 'cache-first'
    })
    
    return data.employees.map(this.mapNhostEmployee)
  }

  async getEmployee(id: string): Promise<Employee | null> {
    try {
      const { data } = await apolloClient.query({
        query: GET_EMPLOYEE_DETAIL,
        variables: { id },
        fetchPolicy: 'cache-first'
      })
      
      return data.employees_by_pk ? this.mapNhostEmployee(data.employees_by_pk) : null
    } catch (error) {
      console.error('Error fetching employee:', error)
      return null
    }
  }

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const { data: result } = await apolloClient.mutate({
      mutation: CREATE_EMPLOYEE,
      variables: {
        data: {
          svj_id: data.svjId,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          birth_number: data.birthNumber,
          salary: data.salary,
          contract_type: data.contractType,
          bank_account: data.bankAccount,
          health_insurance: data.healthInsurance,
          social_insurance: data.socialInsurance,
          is_active: data.isActive,
          start_date: data.startDate
        }
      }
    })
    
    return this.mapNhostEmployee(result.insert_employees_one)
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const { data: result } = await apolloClient.mutate({
      mutation: UPDATE_EMPLOYEE,
      variables: {
        id,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          birth_number: data.birthNumber,
          salary: data.salary,
          contract_type: data.contractType,
          bank_account: data.bankAccount,
          health_insurance: data.healthInsurance,
          social_insurance: data.socialInsurance,
          is_active: data.isActive,
          start_date: data.startDate,
          end_date: data.endDate
        }
      }
    })
    
    return this.mapNhostEmployee(result.update_employees_by_pk)
  }

  async terminateEmployee(employeeId: string): Promise<void> {
    await apolloClient.mutate({
      mutation: UPDATE_EMPLOYEE,
      variables: {
        id: employeeId,
        data: {
          is_active: false,
          end_date: new Date().toISOString()
        }
      }
    })
  }

  // Payroll endpoints
  async getSVJWithPayrolls(year: number, month: number): Promise<any> {
    const { data } = await apolloClient.query({
      query: GET_SVJ_WITH_PAYROLLS,
      variables: { year, month },
      fetchPolicy: 'cache-first'
    })
    
    return data.svjs
  }

  async getPayrollSummary(svjId: string, year: number, month: number): Promise<any> {
    const { data } = await apolloClient.query({
      query: GET_PAYROLL_SUMMARY,
      variables: { svjId, year, month },
      fetchPolicy: 'cache-first'
    })
    
    return data.svjs_by_pk
  }

  async getSalaryRecords(svjId: string, year: number, month?: number): Promise<SalaryRecord[]> {
    // Implementation using GraphQL
    const { data } = await apolloClient.query({
      query: GET_PAYROLL_DETAIL,
      variables: { svjId, year, month },
      fetchPolicy: 'cache-first'
    })
    
    return data.payrolls.map(this.mapNhostPayroll)
  }

  async createSalaryRecord(data: Omit<SalaryRecord, 'id' | 'createdAt'>): Promise<SalaryRecord> {
    const { data: result } = await apolloClient.mutate({
      mutation: CREATE_PAYROLL,
      variables: {
        data: {
          employee_id: data.employeeId,
          year: data.year,
          month: data.month,
          gross_salary: data.grossSalary,
          net_salary: data.netSalary,
          total_deductions: data.totalDeductions,
          income_tax: data.incomeTax,
          health_insurance_employee: data.healthInsuranceEmployee,
          health_insurance_employer: data.healthInsuranceEmployer,
          social_insurance_employee: data.socialInsuranceEmployee,
          social_insurance_employer: data.socialInsuranceEmployer,
          status: data.status || 'draft'
        }
      }
    })
    
    return this.mapNhostPayroll(result.insert_payrolls_one)
  }

  // Communication campaigns - stub until implemented in schema
  async getCampaigns(): Promise<any[]> {
    // Mock implementation until campaigns are added to schema
    return []
  }

  // Dynamic variables - stub until implemented in schema
  async getDynamicVariables(): Promise<any[]> {
    // Mock implementation until variables are added to schema
    return []
  }

  async createDynamicVariable(data: any): Promise<any> {
    // Mock implementation until variables are added to schema
    return { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() }
  }

  async updateDynamicVariable(id: string, data: any): Promise<any> {
    // Mock implementation until variables are added to schema
    return { id, ...data, updatedAt: new Date().toISOString() }
  }

  async deleteDynamicVariable(id: string): Promise<void> {
    // Mock implementation until variables are added to schema
    return Promise.resolve()
  }

  // Payroll workflow methods - stub until implemented in schema  
  async getPayrollCycles(year: number, month: number): Promise<any[]> {
    // Mock implementation until cycles are added to schema
    return []
  }

  async getSVJPayrolls(year: number, month: number): Promise<any[]> {
    // Mock implementation until payroll workflow is added to schema
    return []
  }

  async getCompanySettings(): Promise<any> {
    // Mock implementation until company settings are added to schema
    return {
      basicInfo: { name: '', registrationNumber: '', taxNumber: '' },
      address: { street: '', city: '', postalCode: '', country: '' },
      contact: { phone: '', email: '', website: '' },
      bankAccounts: []
    }
  }

  // Email templates endpoints - Keep mock for now until implemented in schema
  async getEmailTemplates(_svjId?: string): Promise<EmailTemplate[]> {
    // Mock implementation until email templates are added to schema
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
    const { data } = await apolloClient.query({
      query: GET_DASHBOARD_STATS,
      fetchPolicy: 'cache-first'
    })
    
    return {
      totalSvj: data.svjs_aggregate.aggregate.count,
      totalEmployees: data.employees_aggregate.aggregate.count,
      pendingSalaries: data.payrolls_aggregate.aggregate.count,
      completedSalariesThisMonth: data.payrolls_aggregate.aggregate.count,
      pendingCampaigns: 0, // Mock until implemented
      recentActivities: [], // Mock until implemented
      userNote: "" // Mock until implemented
    }
  }

  // User note management - Mock until implemented
  async updateUserNote(note: string): Promise<void> {
    console.log('Updating user note:', note)
    // TODO: Implement when user preferences are added to schema
  }

  // Registry integration - Keep mock
  async verifyIcoInRegistry(ico: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return {
      isVerified: true,
      officialName: "Společenství vlastníků jednotek Na Příkladě 123/45",
      address: "Na Příkladě 123/45, 110 00 Praha 1",
      status: 'active'
    }
  }

  // Helper methods for mapping Nhost data to our types
  private mapNhostSVJ(nhostSvj: any): SVJ {
    return {
      id: nhostSvj.id,
      name: nhostSvj.name,
      ico: nhostSvj.ico,
      dic: nhostSvj.dic,
      address: nhostSvj.address,
      bankAccount: nhostSvj.bank_account,
      contactPerson: nhostSvj.contact_person,
      contactEmail: nhostSvj.contact_email,
      quickDescription: '', // Not in schema yet
      reportDeliveryMethod: 'manager', // Not in schema yet
      isActive: nhostSvj.is_active,
      createdAt: new Date(nhostSvj.created_at),
      updatedAt: new Date(nhostSvj.updated_at || nhostSvj.created_at),
      registryData: {
        officialName: nhostSvj.name,
        verificationDate: new Date(),
        isVerified: true
      }
    }
  }

  private mapNhostEmployee(nhostEmployee: any): Employee {
    return {
      id: nhostEmployee.id,
      svjId: nhostEmployee.svj_id,
      firstName: nhostEmployee.first_name,
      lastName: nhostEmployee.last_name,
      email: nhostEmployee.email,
      phone: nhostEmployee.phone,
      address: nhostEmployee.address,
      birthNumber: nhostEmployee.birth_number,
      salary: nhostEmployee.salary,
      contractType: nhostEmployee.contract_type,
      bankAccount: nhostEmployee.bank_account,
      healthInsurance: nhostEmployee.health_insurance,
      socialInsurance: nhostEmployee.social_insurance,
      executions: [], // Not implemented yet
      hasPinkDeclaration: false, // Not implemented yet
      isActive: nhostEmployee.is_active,
      startDate: new Date(nhostEmployee.start_date),
      endDate: nhostEmployee.end_date ? new Date(nhostEmployee.end_date) : undefined,
      createdAt: new Date(nhostEmployee.created_at),
      updatedAt: new Date(nhostEmployee.updated_at || nhostEmployee.created_at)
    }
  }

  private mapNhostPayroll(nhostPayroll: any): SalaryRecord {
    return {
      id: nhostPayroll.id,
      employeeId: nhostPayroll.employee_id,
      year: nhostPayroll.year,
      month: nhostPayroll.month,
      grossSalary: nhostPayroll.gross_salary,
      netSalary: nhostPayroll.net_salary,
      totalDeductions: nhostPayroll.total_deductions,
      incomeTax: nhostPayroll.income_tax,
      healthInsuranceEmployee: nhostPayroll.health_insurance_employee,
      healthInsuranceEmployer: nhostPayroll.health_insurance_employer,
      socialInsuranceEmployee: nhostPayroll.social_insurance_employee,
      socialInsuranceEmployer: nhostPayroll.social_insurance_employer,
      status: nhostPayroll.status,
      createdAt: new Date(nhostPayroll.created_at)
    }
  }
}

export const nhostApiService = new NhostApiService()
export default nhostApiService
