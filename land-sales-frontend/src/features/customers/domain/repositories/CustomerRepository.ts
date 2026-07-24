import type { Customer, CustomerFormInput, CustomerPage } from '../entities/Customer'

export type CustomerQuery = {
  page: number
  size: number
  search?: string
  active?: boolean
}

export interface CustomerRepository {
  getCustomers(query: CustomerQuery): Promise<CustomerPage>
  getCustomer(id: number): Promise<Customer>
  createCustomer(input: CustomerFormInput): Promise<Customer>
  updateCustomer(id: number, input: CustomerFormInput): Promise<Customer>
  changeStatus(id: number, active: boolean): Promise<Customer>
}
