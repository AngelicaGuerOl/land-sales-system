import type { Customer, CustomerFormInput, CustomerPage } from '../../domain/entities/Customer'

export type CustomerDto = {
  id: number
  fullName: string
  phone: string
  alternatePhone: string | null
  address: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CustomerPageDto = {
  content: CustomerDto[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export const CustomerMapper = {
  toCustomer(dto: CustomerDto): Customer {
    return { ...dto }
  },
  toPage(dto: CustomerPageDto): CustomerPage {
    return { ...dto, content: dto.content.map(CustomerMapper.toCustomer) }
  },
  toRequest(input: CustomerFormInput) {
    return {
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      alternatePhone: input.alternatePhone?.trim() || null,
      address: input.address?.trim() || null,
    }
  },
}
