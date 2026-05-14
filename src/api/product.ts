import api from './axios'

export interface TagDTO {
  id: number
  name: string
  color: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  isActive: boolean
  tags: TagDTO[]
}

export interface PageResponse<T> {
  content: T[]
  page: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

export const productApi = {
  getAll(page: number = 0, size: number = 8) {
    return api.get<PageResponse<Product>>('/products', { params: { page, size } })
  },

  search(keyword: string = '', tagId: number | null = null, page: number = 0, size: number = 8) {
    const params: { page: number; size: number; keyword?: string; tagId?: number } = { page, size }
    if (keyword) params.keyword = keyword
    if (tagId) params.tagId = tagId
    return api.get<PageResponse<Product>>('/products/search', { params })
  },

  getById(id: number) {
    return api.get<Product>(`/products/${id}`)
  },

  getByTag(tagId: number, page: number = 0, size: number = 8) {
    return api.get<PageResponse<Product>>(`/products/tag/${tagId}`, { params: { page, size } })
  },

  getAllAdmin(page: number = 0, size: number = 10) {
    return api.get<PageResponse<Product>>('/products/all', { params: { page, size } })
  },

  searchAdmin(keyword: string, page: number = 0, size: number = 10) {
    return api.get<PageResponse<Product>>('/products/search/admin', {
      params: { keyword, page, size },
    })
  },

  create(product: Partial<Product>) {
    return api.post<Product>('/products', product)
  },

  update(id: number, product: Partial<Product>) {
    return api.put<Product>(`/products/${id}`, product)
  },

  delete(id: number) {
    return api.delete(`/products/${id}`)
  },
}
