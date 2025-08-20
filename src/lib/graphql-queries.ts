import { gql } from '@apollo/client'

// SVJ dotazy
export const GET_SVJ_LIST = gql`
  query GetSVJList {
    svjs {
      id
      name
      ico
      dic
      address
      bank_account
      contact_person
      contact_email
      is_active
      created_at
      updated_at
    }
  }
`

export const GET_SVJ_DETAIL = gql`
  query GetSVJDetail($id: uuid!) {
    svjs_by_pk(id: $id) {
      id
      name
      ico
      dic
      address
      bank_account
      contact_person
      contact_email
      is_active
      created_at
      updated_at
      employees {
        id
        first_name
        last_name
        email
        phone
        salary
        is_active
        start_date
        end_date
      }
    }
  }
`

// Employee dotazy
export const GET_EMPLOYEES = gql`
  query GetEmployees($svjId: uuid) {
    employees(where: { svj_id: { _eq: $svjId } }) {
      id
      svj_id
      first_name
      last_name
      email
      phone
      address
      birth_number
      salary
      contract_type
      bank_account
      health_insurance
      social_insurance
      is_active
      start_date
      end_date
      created_at
      updated_at
      svj {
        id
        name
      }
    }
  }
`

export const GET_EMPLOYEE_DETAIL = gql`
  query GetEmployeeDetail($id: uuid!) {
    employees_by_pk(id: $id) {
      id
      svj_id
      first_name
      last_name
      email
      phone
      address
      birth_number
      salary
      contract_type
      bank_account
      health_insurance
      social_insurance
      is_active
      start_date
      end_date
      created_at
      updated_at
      svj {
        id
        name
      }
      payrolls {
        id
        year
        month
        gross_salary
        net_salary
        total_deductions
        status
        created_at
      }
    }
  }
`

// Payroll dotazy
export const GET_SVJ_WITH_PAYROLLS = gql`
  query GetSVJWithPayrolls($year: Int!, $month: Int!) {
    svjs {
      id
      name
      ico
      address
      employees_aggregate {
        aggregate {
          count
        }
      }
      payrolls(where: { year: { _eq: $year }, month: { _eq: $month } }) {
        id
        status
        employee_id
        year
        month
        gross_salary
        net_salary
        total_deductions
      }
    }
  }
`

export const GET_PAYROLL_SUMMARY = gql`
  query GetPayrollSummary($svjId: uuid!, $year: Int!, $month: Int!) {
    svjs_by_pk(id: $svjId) {
      id
      name
      employees {
        id
        first_name
        last_name
        salary
        payrolls(where: { year: { _eq: $year }, month: { _eq: $month } }) {
          id
          status
          gross_salary
          net_salary
          total_deductions
        }
      }
    }
  }
`

export const GET_PAYROLL_DETAIL = gql`
  query GetPayrollDetail($employeeId: uuid!, $year: Int!, $month: Int!) {
    payrolls(where: { 
      employee_id: { _eq: $employeeId }, 
      year: { _eq: $year }, 
      month: { _eq: $month } 
    }) {
      id
      employee_id
      year
      month
      gross_salary
      net_salary
      total_deductions
      income_tax
      health_insurance_employee
      health_insurance_employer
      social_insurance_employee
      social_insurance_employer
      status
      created_at
      updated_at
      employee {
        id
        first_name
        last_name
        email
        salary
        health_insurance
        social_insurance
        svj {
          id
          name
        }
      }
    }
  }
`

// Dashboard dotazy
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    svjs_aggregate {
      aggregate {
        count
      }
    }
    employees_aggregate(where: { is_active: { _eq: true } }) {
      aggregate {
        count
      }
    }
    payrolls_aggregate(where: { status: { _in: ["draft", "processing"] } }) {
      aggregate {
        count
      }
    }
    payrolls_aggregate(
      where: { 
        status: { _eq: "approved" }, 
        created_at: { _gte: "2024-01-01" } 
      }
    ) {
      aggregate {
        count
      }
    }
  }
`

// Mutations
export const CREATE_SVJ = gql`
  mutation CreateSVJ($data: svjs_insert_input!) {
    insert_svjs_one(object: $data) {
      id
      name
      ico
      dic
      address
      bank_account
      contact_person
      contact_email
      is_active
      created_at
    }
  }
`

export const UPDATE_SVJ = gql`
  mutation UpdateSVJ($id: uuid!, $data: svjs_set_input!) {
    update_svjs_by_pk(pk_columns: { id: $id }, _set: $data) {
      id
      name
      ico
      dic
      address
      bank_account
      contact_person
      contact_email
      is_active
      updated_at
    }
  }
`

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($data: employees_insert_input!) {
    insert_employees_one(object: $data) {
      id
      svj_id
      first_name
      last_name
      email
      phone
      address
      birth_number
      salary
      contract_type
      bank_account
      health_insurance
      social_insurance
      is_active
      start_date
      created_at
    }
  }
`

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: uuid!, $data: employees_set_input!) {
    update_employees_by_pk(pk_columns: { id: $id }, _set: $data) {
      id
      svj_id
      first_name
      last_name
      email
      phone
      address
      birth_number
      salary
      contract_type
      bank_account
      health_insurance
      social_insurance
      is_active
      start_date
      end_date
      updated_at
    }
  }
`

export const CREATE_PAYROLL = gql`
  mutation CreatePayroll($data: payrolls_insert_input!) {
    insert_payrolls_one(object: $data) {
      id
      employee_id
      year
      month
      gross_salary
      net_salary
      total_deductions
      income_tax
      health_insurance_employee
      health_insurance_employer
      social_insurance_employee
      social_insurance_employer
      status
      created_at
    }
  }
`

export const UPDATE_PAYROLL_STATUS = gql`
  mutation UpdatePayrollStatus($id: uuid!, $status: String!) {
    update_payrolls_by_pk(
      pk_columns: { id: $id }, 
      _set: { status: $status, updated_at: "now()" }
    ) {
      id
      status
      updated_at
    }
  }
`
