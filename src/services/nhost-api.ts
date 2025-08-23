import { apiService } from './api'

const svc: any = apiService

// Adapter that preserves the NhostApiService surface but delegates to the Supabase service stored in `svc`.
class NhostApiService {
  async getSVJList() { return svc.getSVJList() }
  async getSVJ(id: string) { return svc.getSVJ(id) }
  async createSVJ(payload: any) { return svc.createSVJ(payload) }
  async updateSVJ(id: string, payload: any) { return svc.updateSVJ(id, payload) }
  async getEmployees(svjId?: string) { return svc.getEmployees(svjId) }
  async getEmployee(id: string) { return svc.getEmployee(id) }
  async createEmployee(payload: any) { return svc.createEmployee(payload) }
  async updateEmployee(id: string, payload: any) { return svc.updateEmployee(id, payload) }
  async terminateEmployee(employeeId: string) { return svc.terminateEmployee(employeeId) }
  async getSVJWithPayrolls(year: number, month: number) { return svc.getSVJWithPayrolls ? svc.getSVJWithPayrolls(year, month) : svc.getSVJList() }
  async getPayrollSummary(svjId: string, year: number, month: number) { return svc.getPayrollSummary ? svc.getPayrollSummary(svjId, year, month) : null }
  async getSalaryRecords(svjId: string, year: number, month?: number) { return svc.getSalaryRecords(svjId, year, month) }
  async createSalaryRecord(payload: any) { return svc.createSalaryRecord(payload) }
  async getCampaigns() { return svc.getCampaigns ? svc.getCampaigns() : [] }
  async getDynamicVariables() { return svc.getDynamicVariables ? svc.getDynamicVariables() : [] }
  async createDynamicVariable(data: any) { return svc.createDynamicVariable ? svc.createDynamicVariable(data) : { id: Date.now().toString(), ...data } }
  async updateDynamicVariable(id: string, data: any) { return svc.updateDynamicVariable ? svc.updateDynamicVariable(id, data) : { id, ...data } }
  async deleteDynamicVariable(id: string) { return svc.deleteDynamicVariable ? svc.deleteDynamicVariable(id) : Promise.resolve() }
  async getPayrollCycles(year: number, month: number) { return svc.getPayrollCycles ? svc.getPayrollCycles(year, month) : [] }
  async getSVJPayrolls(year: number, month: number) { return svc.getSVJPayrolls ? svc.getSVJPayrolls(year, month) : [] }
  async getCompanySettings() { return svc.getCompanySettings ? svc.getCompanySettings() : { basicInfo: { name: '', registrationNumber: '', taxNumber: '' }, address: { street: '', city: '', postalCode: '', country: '' }, contact: { phone: '', email: '', website: '' }, bankAccounts: [] } }
  async getEmailTemplates(svjId?: string) { return svc.getEmailTemplates ? svc.getEmailTemplates(svjId) : [] }
  async getDashboardStats() { return svc.getDashboardStats() }
  async updateUserNote(note: string) { return svc.updateUserNote ? svc.updateUserNote(note) : Promise.resolve() }
  async verifyIcoInRegistry(ico: string) { return svc.verifyIcoInRegistry ? svc.verifyIcoInRegistry(ico) : { isVerified: true } }
}

export const nhostApiService = new NhostApiService()
export default nhostApiService
