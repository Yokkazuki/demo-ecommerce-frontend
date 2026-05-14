import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productApi, type Product } from '@/api/product'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const totalElements = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(0)
  const keyword = ref('')

  // 前台
  async function fetchProducts(page: number = 0, size: number = 8) {
    loading.value = true
    keyword.value = ''
    try {
      const res = await productApi.getAll(page, size)
      products.value = res.data.content
      totalElements.value = res.data.page.totalElements
      totalPages.value = res.data.page.totalPages
      currentPage.value = res.data.page.number
    } finally {
      loading.value = false
    }
  }

  async function searchProducts(
    kw: string,
    tagId: number | null = null,
    page: number = 0,
    size: number = 8,
  ) {
    loading.value = true
    keyword.value = kw
    try {
      const res = await productApi.search(kw, tagId, page, size)
      products.value = res.data.content
      totalElements.value = res.data.page.totalElements
      totalPages.value = res.data.page.totalPages
      currentPage.value = res.data.page.number
    } finally {
      loading.value = false
    }
  }

  // 後台
  async function fetchAllProducts(page: number = 0, size: number = 10) {
    loading.value = true
    keyword.value = ''
    try {
      const res = await productApi.getAllAdmin(page, size)
      products.value = res.data.content
      totalElements.value = res.data.page.totalElements
      totalPages.value = res.data.page.totalPages
      currentPage.value = res.data.page.number
    } finally {
      loading.value = false
    }
  }

  async function searchAllProducts(kw: string, page: number = 0, size: number = 10) {
    loading.value = true
    keyword.value = kw
    try {
      const res = await productApi.searchAdmin(kw, page, size)
      products.value = res.data.content
      totalElements.value = res.data.page.totalElements
      totalPages.value = res.data.page.totalPages
      currentPage.value = res.data.page.number
    } finally {
      loading.value = false
    }
  }

  async function createProduct(product: Partial<Product>) {
    const res = await productApi.create(product)
    products.value.unshift(res.data)
    return res.data
  }

  async function updateProduct(id: number, product: Partial<Product>) {
    const res = await productApi.update(id, product)
    const index = products.value.findIndex((p) => p.id === id)
    if (index !== -1) products.value[index] = res.data
    return res.data
  }

  async function deleteProduct(id: number) {
    await productApi.delete(id)
    products.value = products.value.filter((p) => p.id !== id)
  }

  return {
    products,
    loading,
    totalElements,
    totalPages,
    currentPage,
    keyword,
    fetchProducts,
    searchProducts,
    fetchAllProducts,
    searchAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})
