import { httpClient } from '../../../shared/api/httpClient'
import type { Customer, CustomerFormInput, CustomerPage } from '../domain/entities/Customer'
import type { CustomerQuery, CustomerRepository } from '../domain/repositories/CustomerRepository'
import { CustomerMapper, type CustomerDto, type CustomerPageDto } from './mappers/CustomerMapper'

export class CustomerRepositoryImpl implements CustomerRepository {
  async getCustomers(query: CustomerQuery): Promise<CustomerPage> {
    const params = new URLSearchParams({ page: String(query.page), size: String(query.size) })
    if (query.search?.trim()) params.set('search', query.search.trim())
    if (query.active !== undefined) params.set('active', String(query.active))
    return CustomerMapper.toPage(await httpClient.get<CustomerPageDto>(`/customers?${params.toString()}`))
  }

  async getCustomer(id: number): Promise<Customer> {
    return CustomerMapper.toCustomer(await httpClient.get<CustomerDto>(`/customers/${id}`))
  }

  async createCustomer(input: CustomerFormInput): Promise<Customer> {
    return CustomerMapper.toCustomer(await httpClient.post<CustomerDto>('/customers', CustomerMapper.toRequest(input)))
  }

  async updateCustomer(id: number, input: CustomerFormInput): Promise<Customer> {
    return CustomerMapper.toCustomer(await httpClient.put<CustomerDto>(`/customers/${id}`, CustomerMapper.toRequest(input)))
  }

  async changeStatus(id: number, active: boolean): Promise<Customer> {
    return CustomerMapper.toCustomer(await httpClient.patch<CustomerDto>(`/customers/${id}/status`, { active }))
  }
}
