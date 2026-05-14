import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi, type CartResponse, type AddToCartRequest } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const cart = ref<CartResponse | null>(null)
  const loading = ref(false)
  const addingMap = ref<Record<number, boolean>>({})
  const updatingMap = ref<Record<number, boolean>>({})

  const totalItems = computed(() => cart.value?.totalItems ?? 0)
  const totalAmount = computed(() => cart.value?.totalAmount ?? 0)

  function getQuantity(productId: number): number {
    const item = cart.value?.items?.find((i) => i.productId === productId)
    return item?.quantity ?? 0
  }

  function getCartItemId(productId: number): number | null {
    return cart.value?.items?.find((i) => i.productId === productId)?.id ?? null
  }

  async function fetchCart() {
    loading.value = true
    try {
      const res = await cartApi.getCart()
      cart.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function addToCart(data: AddToCartRequest) {
    addingMap.value[data.productId] = true
    try {
      const res = await cartApi.addToCart(data)
      cart.value = res.data
    } finally {
      addingMap.value[data.productId] = false
    }
  }

  async function updateCartItem(itemId: number, quantity: number) {
    updatingMap.value[itemId] = true
    try {
      const res = await cartApi.updateCartItem(itemId, { quantity })
      cart.value = res.data
    } finally {
      updatingMap.value[itemId] = false
    }
  }

  async function removeCartItem(itemId: number) {
    updatingMap.value[itemId] = true
    try {
      const res = await cartApi.removeCartItem(itemId)
      cart.value = res.data
    } finally {
      updatingMap.value[itemId] = false
    }
  }

  return {
    cart,
    loading,
    addingMap,
    updatingMap,
    totalItems,
    totalAmount,
    getQuantity,
    getCartItemId,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
  }
})
