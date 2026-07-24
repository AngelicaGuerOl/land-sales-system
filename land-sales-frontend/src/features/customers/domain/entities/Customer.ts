export type Customer = {
  id: number
  fullName: string
  phone: string
  alternatePhone: string | null
  address: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CustomerFormInput = {
  fullName: string
  phone: string
  alternatePhone: string | null
  address: string | null
}

export type CustomerPage = {
  content: Customer[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
